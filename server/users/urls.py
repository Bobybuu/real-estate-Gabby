# users/urls.py
from django.urls import path
from django.http import JsonResponse
from django.middleware.csrf import get_token
from . import views

urlpatterns = [
    # =========================================================================
    # AUTHENTICATION ENDPOINTS
    # =========================================================================
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('csrf/', lambda request: JsonResponse({'csrfToken': get_token(request)})),
    
    # =========================================================================
    # DASHBOARD ENDPOINTS
    # =========================================================================
    path('dashboard/overview/', views.dashboard_overview, name='dashboard-overview'),
    path('dashboard/quick-stats/', views.dashboard_quick_stats, name='dashboard-quick-stats'),
    
    # =========================================================================
    # USER PROFILE & ACCOUNT MANAGEMENT
    # =========================================================================
    path('dashboard/profile/', views.user_profile_api, name='user-profile-api'),
    path('dashboard/account/', views.user_account_api, name='user-account-api'),
    
    # =========================================================================
    # ACTIVITY & TRACKING ENDPOINTS
    # =========================================================================
    path('dashboard/activities/', views.user_activities, name='user-activities'),
    path('dashboard/track-activity/', views.track_user_activity, name='track-user-activity'),
    
    # =========================================================================
    # SEARCH MANAGEMENT ENDPOINTS
    # =========================================================================
    path('dashboard/saved-searches/', views.saved_searches, name='saved-searches'),
    path('dashboard/saved-searches/<int:search_id>/', views.saved_searches, name='saved-search-detail'),
    
    # =========================================================================
    # SELLER & AGENT ENDPOINTS
    # =========================================================================
    path('seller/apply/', views.SellerApplicationView.as_view(), name='seller-apply'),
    
    # =========================================================================
    # ADMIN ENDPOINTS
    # =========================================================================
    path('admin/dashboard/stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('admin/seller-applications/', views.admin_seller_applications, name='admin-seller-applications'),
    
    # =========================================================================
    # UTILITY & TESTING ENDPOINTS
    # =========================================================================
    path('csrf-test/', views.CSRFTestView.as_view(), name='csrf-test'),
]

# =============================================================================
# API DOCUMENTATION GROUPS (for reference)
# =============================================================================
"""
API ENDPOINT GROUPS:

AUTHENTICATION:
  POST   /api/users/login/          - User login
  POST   /api/users/register/       - User registration  
  POST   /api/users/logout/         - User logout
  GET    /api/users/me/             - Current user data
  GET    /api/users/csrf/           - Get CSRF token

DASHBOARD:
  GET    /api/users/dashboard/overview/     - Comprehensive dashboard data
  GET    /api/users/dashboard/quick-stats/  - Lightweight dashboard stats

PROFILE MANAGEMENT:
  GET    /api/users/dashboard/profile/      - Get user profile
  PUT    /api/users/dashboard/profile/      - Update user profile
  GET    /api/users/dashboard/account/      - Get account settings  
  PUT    /api/users/dashboard/account/      - Update account settings

ACTIVITY & ANALYTICS:
  GET    /api/users/dashboard/activities/   - Get user activity history
  POST   /api/users/dashboard/track-activity/ - Track new user activity

SEARCH MANAGEMENT:
  GET    /api/users/dashboard/saved-searches/    - List saved searches
  POST   /api/users/dashboard/saved-searches/    - Create saved search
  DELETE /api/users/dashboard/saved-searches/<id>/ - Delete saved search

SELLER/AGENT:
  POST   /api/users/seller/apply/           - Submit seller application

ADMIN:
  GET    /api/users/admin/dashboard/stats/      - Admin platform stats
  GET    /api/users/admin/seller-applications/  - List seller applications
  POST   /api/users/admin/seller-applications/  - Update application status
"""