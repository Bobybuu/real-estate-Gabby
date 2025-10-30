# users/views.py
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt
import json
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.views import APIView
from django.db.models import Count, Q, Sum
from datetime import datetime, timedelta

from .models import User, UserProfile, SellerApplication, UserActivity, SavedSearch
from properties.models import Property
from .serializers import (
    EnhancedUserSerializer, DashboardUserSerializer, UserActivitySerializer, 
    SavedSearchSerializer, UserProfileSerializer, SellerApplicationSerializer,
    UserRegistrationSerializer, DashboardStatsSerializer, UserUpdateSerializer,
    UserSearchSerializer
)

# =============================================================================
# CLASS-BASED VIEWS (Maintaining your existing pattern)
# =============================================================================

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(username=username, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'user': EnhancedUserSerializer(user).data,
                    'message': 'Login successful'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid credentials'
                }, status=401)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            # Use the enhanced registration serializer
            serializer = UserRegistrationSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                
                login(request, user)
                
                return JsonResponse({
                    'success': True,
                    'user': EnhancedUserSerializer(user).data,
                    'message': 'Registration successful'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=400)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    @method_decorator(csrf_protect)
    def post(self, request):
        logout(request)
        return JsonResponse({
            'success': True,
            'message': 'Logout successful'
        })

class CurrentUserView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({
                'success': True,
                'user': EnhancedUserSerializer(request.user).data
            })
        else:
            return JsonResponse({
                'success': False,
                'user': None
            })

class SellerApplicationView(View):
    @method_decorator(login_required)
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            # Check if user already has a pending application
            pending_app = SellerApplication.objects.filter(
                user=request.user, 
                status='pending'
            ).exists()
            
            if pending_app:
                return JsonResponse({
                    'success': False,
                    'message': 'You already have a pending application'
                }, status=400)
            
            application = SellerApplication.objects.create(
                user=request.user,
                application_data=data
            )
            
            # Update user type to seller (pending approval)
            request.user.user_type = 'seller'
            request.user.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Application submitted successfully',
                'application_id': application.id
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)

# =============================================================================
# DRF API VIEWS (Enhanced Dashboard Functionality)
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_overview(request):
    """Enhanced dashboard overview with comprehensive stats"""
    user = request.user
    
    # Recent activities (last 10)
    recent_activities = UserActivity.objects.filter(user=user).select_related('property')[:10]
    
    # Calculate various counts based on user type
    total_favorites = user.favorite_properties.count() if hasattr(user, 'favorite_properties') else 0
    total_listings = user.properties_created.count() if hasattr(user, 'properties_created') else 0
    total_inquiries = user.inquiries_made.count() if hasattr(user, 'inquiries_made') else 0
    total_saved_searches = user.saved_searches.filter(is_active=True).count()
    
    # Property views count (from activity log)
    total_property_views = UserActivity.objects.filter(
        user=user, 
        activity_type='property_view'
    ).count()
    
    # Seller/Agent specific stats
    listing_stats = None
    application_status = None
    application_details = None
    
    if user.user_type in ['seller', 'agent']:
        my_listings = Property.objects.filter(owner=user)
        listing_stats = {
            'active': my_listings.filter(status='active').count(),
            'pending': my_listings.filter(status='pending').count(),
            'draft': my_listings.filter(status='draft').count(),
            'sold': my_listings.filter(status='sold').count(),
            'total': my_listings.count(),
            }
        
        # Check application status
        pending_application = user.seller_applications.filter(status='pending').first()
        if pending_application:
            application_status = 'pending'
            application_details = SellerApplicationSerializer(pending_application).data
        elif user.seller_applications.filter(status='approved').exists():
            application_status = 'approved'
        elif user.seller_applications.filter(status='rejected').exists():
            application_status = 'rejected'
    
    # Compile dashboard data
    dashboard_data = {
        'total_favorites': total_favorites,
        'total_listings': total_listings,
        'total_inquiries': total_inquiries,
        'total_saved_searches': total_saved_searches,
        'total_property_views': total_property_views,
        'recent_activities': UserActivitySerializer(recent_activities, many=True).data,
        'unread_messages': 0,  # Placeholder for messaging system
        'pending_tours': 0,    # Placeholder for tour scheduling
        'new_matches': 0,      # Placeholder for property matches
        'active_listings': listing_stats['active'] if listing_stats else 0,
        'pending_listings': listing_stats['pending'] if listing_stats else 0,
        'sold_listings': listing_stats['sold'] if listing_stats else 0,
        'total_commission': 0,  # Placeholder for commission tracking
        'application_status': application_status,
        'application_details': application_details,
    }
    
    serializer = DashboardStatsSerializer(dashboard_data)
    return Response(serializer.data)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    """Enhanced user profile API with full CRUD support"""
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist
        profile = UserProfile.objects.create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_account_api(request):
    """User account settings update"""
    user = request.user
    
    if request.method == 'GET':
        serializer = EnhancedUserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(EnhancedUserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_activities(request):
    """Paginated user activities with filtering"""
    activity_type = request.GET.get('type', None)
    date_range = request.GET.get('date_range', None)  # today, week, month
    
    activities = UserActivity.objects.filter(user=request.user).select_related('property')
    
    # Filter by activity type
    if activity_type:
        activities = activities.filter(activity_type=activity_type)
    
    # Filter by date range
    if date_range:
        now = datetime.now()
        if date_range == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            activities = activities.filter(created_at__gte=start_date)
        elif date_range == 'week':
            start_date = now - timedelta(days=7)
            activities = activities.filter(created_at__gte=start_date)
        elif date_range == 'month':
            start_date = now - timedelta(days=30)
            activities = activities.filter(created_at__gte=start_date)
    
    # Pagination (simple version)
    page = int(request.GET.get('page', 1))
    page_size = 20
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    
    paginated_activities = activities[start_index:end_index]
    
    serializer = UserActivitySerializer(paginated_activities, many=True)
    
    return Response({
        'activities': serializer.data,
        'total_count': activities.count(),
        'page': page,
        'page_size': page_size,
        'has_next': end_index < activities.count()
    })

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def saved_searches(request, search_id=None):
    """Enhanced saved searches with individual search management"""
    
    if request.method == 'GET':
        searches = SavedSearch.objects.filter(user=request.user)
        serializer = SavedSearchSerializer(searches, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SavedSearchSerializer(data=request.data)
        if serializer.is_valid():
            # Check for duplicate search names
            existing = SavedSearch.objects.filter(
                user=request.user, 
                name=serializer.validated_data['name']
            ).exists()
            
            if existing:
                return Response({
                    'error': 'A saved search with this name already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE' and search_id:
        try:
            search = SavedSearch.objects.get(id=search_id, user=request.user)
            search.delete()
            return Response({'message': 'Saved search deleted successfully'})
        except SavedSearch.DoesNotExist:
            return Response(
                {'error': 'Saved search not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_quick_stats(request):
    """Lightweight endpoint for dashboard quick stats"""
    user = request.user
    
    # Fast counts for dashboard cards
    stats = {
        'favorites_count': user.favorite_properties.count() if hasattr(user, 'favorite_properties') else 0,
        'searches_count': user.saved_searches.filter(is_active=True).count(),
        'views_today': UserActivity.objects.filter(
            user=user, 
            activity_type='property_view',
            created_at__date=datetime.now().date()
        ).count(),
        'inquiries_count': user.inquiries_made.count() if hasattr(user, 'inquiries_made') else 0,
    }
    
    # Add seller-specific stats
    if user.user_type in ['seller', 'agent']:
        stats.update({
            'active_listings': Property.objects.filter(owner=user, status='active').count(),
            'pending_listings': Property.objects.filter(owner=user, status='pending').count(),
            'total_views': UserActivity.objects.filter(
                property__owner=user, 
                activity_type='property_view'
            ).count(),
        })
    
    return Response(stats)

# =============================================================================
# ADMIN & MANAGEMENT VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """Admin dashboard overview"""
    total_users = User.objects.count()
    total_properties = Property.objects.count()
    total_sellers = User.objects.filter(user_type='seller').count()
    total_agents = User.objects.filter(user_type='agent').count()
    
    # Recent signups (last 30 days)
    recent_signups = User.objects.filter(
        date_joined__gte=datetime.now() - timedelta(days=30)
    ).count()
    
    # Pending applications
    pending_applications = SellerApplication.objects.filter(status='pending').count()
    
    return Response({
        'total_users': total_users,
        'total_properties': total_properties,
        'total_sellers': total_sellers,
        'total_agents': total_agents,
        'recent_signups': recent_signups,
        'pending_applications': pending_applications,
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_seller_applications(request):
    """Admin management of seller applications"""
    if request.method == 'GET':
        status_filter = request.GET.get('status', 'pending')
        applications = SellerApplication.objects.filter(status=status_filter).select_related('user')
        serializer = SellerApplicationSerializer(applications, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Update application status
        application_id = request.data.get('application_id')
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')
        
        try:
            application = SellerApplication.objects.get(id=application_id)
            application.status = new_status
            application.admin_notes = admin_notes
            application.reviewed_at = datetime.now()
            application.reviewed_by = request.user
            application.save()
            
            # If approved, ensure user type is set to seller
            if new_status == 'approved':
                application.user.user_type = 'seller'
                application.user.save()
            
            return Response(SellerApplicationSerializer(application).data)
        
        except SellerApplication.DoesNotExist:
            return Response(
                {'error': 'Application not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# =============================================================================
# UTILITY VIEWS
# =============================================================================

class CSRFTestView(View):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return JsonResponse({
            'message': 'CSRF cookie set',
            'has_csrf_cookie': 'csrftoken' in request.COOKIES
        })
    
    @method_decorator(csrf_protect)
    def post(self, request):
        return JsonResponse({
            'message': 'CSRF protection working!'
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_user_activity(request):
    """Endpoint to track user activities from frontend"""
    try:
        activity_type = request.data.get('type')
        property_id = request.data.get('property_id')
        search_query = request.data.get('search_query')
        metadata = request.data.get('metadata', {})
        
        property_obj = None
        if property_id:
            try:
                property_obj = Property.objects.get(id=property_id)
            except Property.DoesNotExist:
                pass
        
        activity = UserActivity.objects.create(
            user=request.user,
            activity_type=activity_type,
            property=property_obj,
            search_query=search_query,
            metadata=metadata
        )
        
        return Response({'success': True, 'activity_id': activity.id})
    
    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )