# properties/views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Min, Max
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Q, Count, Avg, Min, Max
from rest_framework import viewsets, status, filters
from django.http import JsonResponse
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from .models import (
    Property, PropertyImage, Favorite, Inquiry,
    PropertyMedia, Amenity, PropertyAmenity, LegalDocument, PropertyContact
)
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer, PropertySerializer,
    FavoriteSerializer, InquirySerializer, PropertyCreateSerializer,
    PropertyMapSerializer, AmenitySerializer, PropertyAmenitySerializer,
    PropertyMediaSerializer, LegalDocumentSerializer, PropertyContactSerializer,
    PublicInquirySerializer, PropertySearchSerializer, PropertyStatsSerializer,
    AmenityCategorySerializer, InquiryCreateSerializer
)
from .filters import PropertyFilter

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class PropertyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = [
        'title', 'short_description', 'description', 
        'address', 'city', 'state', 'landmarks'
    ]
    ordering_fields = [
        'price', 'created_at', 'updated_at', 'size_acres',
        'views_count', 'inquiry_count', 'published_at'
    ]
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Property.objects.all()
        
        # For public endpoints, only show published properties
        if self.action in ['list', 'retrieve', 'map_data', 'similar', 'search']:
            queryset = queryset.filter(status='published')
        
        # Handle featured filter
        featured_param = self.request.query_params.get('featured')
        if featured_param:
            if featured_param.lower() == 'true':
                queryset = queryset.filter(featured=True)
            elif featured_param.lower() == 'false':
                queryset = queryset.filter(featured=False)
        
        # Handle land type filtering
        land_type = self.request.query_params.get('land_type')
        if land_type:
            queryset = queryset.filter(land_type=land_type)
        
        # Handle property type filtering
        property_type = self.request.query_params.get('property_type')
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        
        # Sellers can see their own draft/pending properties in non-public actions
        if self.request.user.is_authenticated and self.action not in ['list', 'retrieve', 'map_data', 'similar', 'search']:
            user_properties = Property.objects.filter(seller=self.request.user)
            queryset = queryset | user_properties
        
        # Optimize queries based on action
        if self.action == 'list':
            queryset = queryset.select_related('seller').prefetch_related(
                'media', 'images', 'amenities__amenity'
            )
        elif self.action == 'retrieve':
            queryset = queryset.select_related('seller', 'agent', 'contact_info').prefetch_related(
                'media', 'images', 'amenities__amenity', 'documents'
            )
        
        return queryset.distinct()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action == 'create':
            return PropertyCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PropertySerializer
        elif self.action == 'map_data':
            return PropertyMapSerializer
        return PropertyDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    @action(detail=False, methods=['get'])
    def map_data(self, request):
        """Get lightweight property data for map display"""
        queryset = self.get_queryset().filter(
            latitude__isnull=False,
            longitude__isnull=False
        ).only(
            'id', 'title', 'price', 'size_acres', 'latitude', 
            'longitude', 'city', 'land_type', 'property_type'
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get similar properties based on location and type"""
        property_obj = self.get_object()
        
        similar_properties = Property.objects.filter(
            city=property_obj.city,
            property_type=property_obj.property_type,
            status='published'
        ).exclude(id=property_obj.id)[:6]
        
        serializer = PropertyListSerializer(similar_properties, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        property_obj = self.get_object()
        favorite, created = Favorite.objects.get_or_create(
            user=request.user, 
            property=property_obj
        )
        
        if created:
            return Response({'status': 'added to favorites'}, status=status.HTTP_201_CREATED)
        else:
            favorite.delete()
            return Response({'status': 'removed from favorites'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_favorites(self, request):
        """Get user's favorite properties"""
        favorites = Favorite.objects.filter(user=request.user).select_related(
            'property'
        ).prefetch_related(
            'property__media', 'property__images'
        )
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_properties(self, request):
        """Get properties created by the current user"""
        properties = Property.objects.filter(seller=request.user).prefetch_related(
            'media', 'images', 'amenities__amenity'
        )
        serializer = PropertyListSerializer(properties, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def inquire(self, request, pk=None):
        """Create an inquiry for a property (authenticated users)"""
        property_obj = self.get_object()
        serializer = InquiryCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            inquiry = serializer.save(
                user=request.user,
                property=property_obj,
                source='website'
            )
            return Response(InquirySerializer(inquiry).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def increment_views(self, request, pk=None):
        """Increment property view count"""
        property_obj = self.get_object()
        property_obj.views_count += 1
        property_obj.save(update_fields=['views_count'])
        return Response({'views_count': property_obj.views_count})
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced property search with filtering"""
        search_serializer = PropertySearchSerializer(data=request.query_params)
        
        if not search_serializer.is_valid():
            return Response(search_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = search_serializer.validated_data
        queryset = self.get_queryset()
        
        # Apply search filters
        if validated_data.get('search'):
            queryset = queryset.filter(
                Q(title__icontains=validated_data['search']) |
                Q(description__icontains=validated_data['search']) |
                Q(short_description__icontains=validated_data['search']) |
                Q(city__icontains=validated_data['search']) |
                Q(landmarks__icontains=validated_data['search'])
            )
        
        # Price range
        if validated_data.get('min_price'):
            queryset = queryset.filter(price__gte=validated_data['min_price'])
        if validated_data.get('max_price'):
            queryset = queryset.filter(price__lte=validated_data['max_price'])
        
        # Size range
        if validated_data.get('min_size'):
            queryset = queryset.filter(size_acres__gte=validated_data['min_size'])
        if validated_data.get('max_size'):
            queryset = queryset.filter(size_acres__lte=validated_data['max_size'])
        
        # Land type
        if validated_data.get('land_type'):
            queryset = queryset.filter(land_type__in=validated_data['land_type'])
        
        # Property type
        if validated_data.get('property_type'):
            queryset = queryset.filter(property_type__in=validated_data['property_type'])
        
        # Location
        if validated_data.get('location'):
            queryset = queryset.filter(
                Q(city__icontains=validated_data['location']) |
                Q(state__icontains=validated_data['location']) |
                Q(address__icontains=validated_data['location'])
            )
        
        # Amenities
        if validated_data.get('amenities'):
            queryset = queryset.filter(amenities__amenity_id__in=validated_data['amenities'])
        
        # Additional filters
        if validated_data.get('has_title_deed'):
            queryset = queryset.filter(title_deed_status__isnull=False)
        if validated_data.get('has_water'):
            queryset = queryset.filter(
                Q(has_borehole=True) | Q(has_piped_water=True) | Q(water_supply_types__len__gt=0)
            )
        if validated_data.get('has_electricity'):
            queryset = queryset.filter(electricity_availability__in=['on_site', 'nearby'])
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PropertyListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = PropertyListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get property statistics"""
        total_properties = Property.objects.filter(status='published').count()
        land_properties = Property.objects.filter(property_type='land', status='published').count()
        total_views = Property.objects.filter(status='published').aggregate(total=Sum('views_count'))['total'] or 0
        total_inquiries = Inquiry.objects.count()
        
        price_stats = Property.objects.filter(status='published').aggregate(
            avg_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price')
        )
        
        stats_data = {
            'total_properties': total_properties,
            'published_properties': total_properties,
            'land_properties': land_properties,
            'total_views': total_views,
            'total_inquiries': total_inquiries,
            'average_price': price_stats['avg_price'],
            'price_range': {
                'min': price_stats['min_price'],
                'max': price_stats['max_price']
            }
        }
        
        serializer = PropertyStatsSerializer(stats_data)
        return Response(serializer.data)

class InquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InquirySerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins and agents can see all inquiries, regular users see only their own
        if user.is_staff or user.groups.filter(name='Agents').exists():
            return Inquiry.objects.all().select_related('property', 'user', 'assigned_agent')
        else:
            return Inquiry.objects.filter(user=user).select_related('property', 'assigned_agent')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """Update inquiry status"""
        inquiry = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Inquiry.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inquiry.status = new_status
        inquiry.save(update_fields=['status'])
        
        serializer = self.get_serializer(inquiry)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign_agent(self, request, pk=None):
        """Assign agent to inquiry"""
        inquiry = self.get_object()
        agent_id = request.data.get('agent_id')
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            agent = User.objects.get(id=agent_id)
            inquiry.assigned_agent = agent
            inquiry.save(update_fields=['assigned_agent'])
            
            serializer = self.get_serializer(inquiry)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Agent not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class AmenityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Amenity.objects.filter(is_active=True)
    serializer_class = AmenitySerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get amenities grouped by category"""
        from django.db.models import Prefetch
        categories = []
        
        for category_code, category_name in Amenity.CATEGORIES:
            amenities = Amenity.objects.filter(
                category=category_code, 
                is_active=True
            )
            categories.append({
                'category': category_code,
                'category_display': category_name,
                'amenities': AmenitySerializer(amenities, many=True).data
            })
        
        serializer = AmenityCategorySerializer(categories, many=True)
        return Response(serializer.data)

class PropertyMediaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyMediaSerializer
    
    def get_queryset(self):
        return PropertyMedia.objects.filter(property__seller=self.request.user)
    
    def perform_create(self, serializer):
        property_id = self.request.data.get('property')
        try:
            property_obj = Property.objects.get(id=property_id, seller=self.request.user)
            serializer.save(property=property_obj)
        except Property.DoesNotExist:
            raise serializers.ValidationError("Property not found or access denied")

class LegalDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LegalDocumentSerializer
    
    def get_queryset(self):
        return LegalDocument.objects.filter(property__seller=self.request.user)
    
    def perform_create(self, serializer):
        property_id = self.request.data.get('property')
        try:
            property_obj = Property.objects.get(id=property_id, seller=self.request.user)
            serializer.save(property=property_obj)
        except Property.DoesNotExist:
            raise serializers.ValidationError("Property not found or access denied")

# API Views
@api_view(['GET'])
@permission_classes([AllowAny])
def property_categories(request):
    """Get available property and land categories"""
    categories = {
        'property_types': dict(Property.PROPERTY_TYPES),
        'land_types': dict(Property.LAND_TYPES),
        'title_deed_types': dict(Property.TITLE_DEED_TYPES),
    }
    return Response(categories)

@api_view(['POST'])
@permission_classes([AllowAny])
def public_inquiry(request):
    """
    Public inquiry endpoint that doesn't require authentication
    """
    serializer = PublicInquirySerializer(data=request.data)
    
    if serializer.is_valid():
        inquiry = serializer.save(source='website')
        return Response(
            InquirySerializer(inquiry).data, 
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for authenticated user"""
    user = request.user
    
    # Properties stats
    user_properties = Property.objects.filter(seller=user)
    total_properties = user_properties.count()
    published_properties = user_properties.filter(status='published').count()
    draft_properties = user_properties.filter(status='draft').count()
    
    # Inquiry stats
    user_inquiries = Inquiry.objects.filter(property__seller=user)
    total_inquiries = user_inquiries.count()
    new_inquiries = user_inquiries.filter(status='new').count()
    
    # Favorite stats
    favorite_count = Favorite.objects.filter(property__seller=user).count()
    
    # View stats
    total_views = user_properties.aggregate(total=Sum('views_count'))['total'] or 0
    
    stats = {
        'properties': {
            'total': total_properties,
            'published': published_properties,
            'draft': draft_properties,
        },
        'inquiries': {
            'total': total_inquiries,
            'new': new_inquiries,
        },
        'favorites': favorite_count,
        'views': total_views,
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_properties(request):
    """Get properties created by the current user"""
    properties = Property.objects.filter(seller=request.user).prefetch_related(
        'media', 'images', 'amenities__amenity', 'documents'
    )
    serializer = PropertySerializer(properties, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_favorites(request):
    """Get user's favorite properties"""
    favorites = Favorite.objects.filter(user=request.user).select_related(
        'property'
    ).prefetch_related(
        'property__media', 'property__images', 'property__amenities__amenity'
    )
    serializer = FavoriteSerializer(favorites, many=True)
    return Response(serializer.data)

# Simple property creation endpoint for testing
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@method_decorator(csrf_exempt, name='dispatch')
def create_property_simple(request):
    """Simple property creation endpoint"""
    try:
        serializer = PropertyCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            property_obj = serializer.save(seller=request.user)
            
            # Handle image uploads if any
            images = request.FILES.getlist('images')
            for i, image_file in enumerate(images):
                PropertyImage.objects.create(
                    property=property_obj,
                    image=image_file,
                    caption=request.data.get(f'image_captions[{i}]', ''),
                    is_primary=request.data.get(f'image_is_primary[{i}]', 'false').lower() == 'true',
                    order=i
                )
            
            # Handle media uploads
            media_files = request.FILES.getlist('media')
            for i, media_file in enumerate(media_files):
                media_type = request.data.get(f'media_types[{i}]', 'image')
                PropertyMedia.objects.create(
                    property=property_obj,
                    media_type=media_type,
                    file=media_file,
                    caption=request.data.get(f'media_captions[{i}]', ''),
                    is_primary=request.data.get(f'media_is_primary[{i}]', 'false').lower() == 'true',
                    display_order=i
                )
            
            return Response(
                PropertySerializer(property_obj).data, 
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Admin/Management Views
class AdminPropertyViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing all properties"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertySerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return Property.objects.none()
        return Property.objects.all().select_related('seller', 'agent').prefetch_related(
            'media', 'images', 'amenities__amenity', 'documents'
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a property for publishing"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        property_obj = self.get_object()
        property_obj.status = 'published'
        property_obj.save(update_fields=['status'])
        
        serializer = self.get_serializer(property_obj)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a property"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        property_obj = self.get_object()
        property_obj.status = 'draft'
        property_obj.save(update_fields=['status'])
        
        serializer = self.get_serializer(property_obj)
        return Response(serializer.data)