# properties/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PropertyViewSet, InquiryViewSet, AmenityViewSet, 
    PropertyMediaViewSet, LegalDocumentViewSet, AdminPropertyViewSet,
    create_property_simple, my_favorites, my_properties, public_inquiry,
    property_categories, dashboard_stats
)

router = DefaultRouter()
# Core property routes
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')

# New land listing routes
router.register(r'amenities', AmenityViewSet, basename='amenity')
router.register(r'property-media', PropertyMediaViewSet, basename='property-media')
router.register(r'legal-documents', LegalDocumentViewSet, basename='legal-document')

# Admin routes
router.register(r'admin/properties', AdminPropertyViewSet, basename='admin-property')

urlpatterns = [
    path('', include(router.urls)),
    
    # === PROPERTY MANAGEMENT ENDPOINTS ===
    path('create/', create_property_simple, name='create-property'),
    path('my_properties/', my_properties, name='my-properties'),
    path('my_favorites/', my_favorites, name='my-favorites'),
    
    # === PUBLIC ENDPOINTS ===
    path('public-inquiry/', public_inquiry, name='public-inquiry'),
    path('categories/', property_categories, name='property-categories'),
    
    # === DASHBOARD & ANALYTICS ===
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    
    # === PROPERTY SEARCH & DISCOVERY ===
    path('properties/search/advanced/', 
         PropertyViewSet.as_view({'get': 'search'}), 
         name='property-search-advanced'),
    path('properties/map/data/', 
         PropertyViewSet.as_view({'get': 'map_data'}), 
         name='property-map-data'),
    path('properties/stats/overview/', 
         PropertyViewSet.as_view({'get': 'stats'}), 
         name='property-stats-overview'),
    
    # === INDIVIDUAL PROPERTY ACTIONS ===
    path('properties/<int:pk>/similar/', 
         PropertyViewSet.as_view({'get': 'similar'}), 
         name='property-similar'),
    path('properties/<int:pk>/favorite/', 
         PropertyViewSet.as_view({'post': 'favorite'}), 
         name='property-favorite'),
    path('properties/<int:pk>/inquire/', 
         PropertyViewSet.as_view({'post': 'inquire'}), 
         name='property-inquire'),
    path('properties/<int:pk>/increment-views/', 
         PropertyViewSet.as_view({'get': 'increment_views'}), 
         name='property-increment-views'),
    
    # === USER-SPECIFIC ENDPOINTS ===
    path('my-properties/favorites/', 
         PropertyViewSet.as_view({'get': 'my_favorites'}), 
         name='my-favorites-list'),
    path('my-properties/owned/', 
         PropertyViewSet.as_view({'get': 'my_properties'}), 
         name='my-properties-list'),
    
    # === AMENITY MANAGEMENT ===
    path('amenities/categories/grouped/', 
         AmenityViewSet.as_view({'get': 'categories'}), 
         name='amenity-categories-grouped'),
    
    # === INQUIRY MANAGEMENT ===
    path('inquiries/<int:pk>/update-status/', 
         InquiryViewSet.as_view({'post': 'update_status'}), 
         name='inquiry-update-status'),
    path('inquiries/<int:pk>/assign-agent/', 
         InquiryViewSet.as_view({'post': 'assign_agent'}), 
         name='inquiry-assign-agent'),
    
    # === ADMIN MANAGEMENT ENDPOINTS ===
    path('admin/properties/<int:pk>/approve/', 
         AdminPropertyViewSet.as_view({'post': 'approve'}), 
         name='admin-property-approve'),
    path('admin/properties/<int:pk>/reject/', 
         AdminPropertyViewSet.as_view({'post': 'reject'}), 
         name='admin-property-reject'),
    
    
    
]


# REMOVED THE API VERSIONING SECTION 
# v1_patterns = [
#     path('v1/', include(urlpatterns)),
# ]
# urlpatterns += v1_patterns