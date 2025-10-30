# properties/filters.py
import django_filters
from django.db.models import Q
from .models import Property

class PropertyFilter(django_filters.FilterSet):
    # === EXISTING FILTERS ===
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    property_type = django_filters.MultipleChoiceFilter(choices=Property.PROPERTY_TYPES)
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    state = django_filters.CharFilter(field_name='state', lookup_expr='icontains')
    min_bedrooms = django_filters.NumberFilter(field_name='bedrooms', lookup_expr='gte')
    min_bathrooms = django_filters.NumberFilter(field_name='bathrooms', lookup_expr='gte')
    min_square_feet = django_filters.NumberFilter(field_name='square_feet', lookup_expr='gte')
    has_garage = django_filters.BooleanFilter(field_name='has_garage')
    has_pool = django_filters.BooleanFilter(field_name='has_pool')
    has_garden = django_filters.BooleanFilter(field_name='has_garden')
    featured = django_filters.BooleanFilter(field_name='featured')
    
    # === NEW LAND LISTING FILTERS ===
    # Size filters for land properties
    min_size = django_filters.NumberFilter(field_name="size_acres", lookup_expr='gte')
    max_size = django_filters.NumberFilter(field_name="size_acres", lookup_expr='lte')
    
    # Land type filters
    land_type = django_filters.MultipleChoiceFilter(choices=Property.LAND_TYPES)
    
    # Location enhancements
    location = django_filters.CharFilter(method='filter_location')
    zip_code = django_filters.CharFilter(field_name='zip_code', lookup_expr='exact')
    
    # Land-specific characteristic filters
    has_title_deed = django_filters.BooleanFilter(method='filter_has_title_deed')
    title_deed_status = django_filters.MultipleChoiceFilter(choices=Property.TITLE_DEED_TYPES)
    is_negotiable = django_filters.BooleanFilter(field_name='is_negotiable')
    
    # Infrastructure and utility filters
    has_water = django_filters.BooleanFilter(method='filter_has_water')
    has_electricity = django_filters.BooleanFilter(method='filter_has_electricity')
    has_road_access = django_filters.BooleanFilter(method='filter_has_road_access')
    has_sewer_system = django_filters.BooleanFilter(field_name='has_sewer_system')
    has_drainage = django_filters.BooleanFilter(field_name='has_drainage')
    internet_availability = django_filters.BooleanFilter(field_name='internet_availability')
    
    # Water supply specific filters
    has_borehole = django_filters.BooleanFilter(field_name='has_borehole')
    has_piped_water = django_filters.BooleanFilter(field_name='has_piped_water')
    
    # Electricity availability filters
    electricity_availability = django_filters.MultipleChoiceFilter(
        choices=Property._meta.get_field('electricity_availability').choices
    )
    
    # Land development filters
    has_subdivision_approval = django_filters.BooleanFilter(field_name='has_subdivision_approval')
    has_beacons = django_filters.BooleanFilter(field_name='has_beacons')
    is_fenced = django_filters.BooleanFilter(field_name='is_fenced')
    is_gated_community = django_filters.BooleanFilter(field_name='is_gated_community')
    
    # Road access filters
    road_access_type = django_filters.MultipleChoiceFilter(
        method='filter_road_access_type'
    )
    
    # Topography and soil filters
    topography = django_filters.MultipleChoiceFilter(method='filter_topography')
    soil_type = django_filters.MultipleChoiceFilter(method='filter_soil_type')
    
    # Zoning filters
    zoning = django_filters.CharFilter(field_name='zoning', lookup_expr='icontains')
    
    # Plot-specific filters
    min_plots_available = django_filters.NumberFilter(field_name='num_plots_available', lookup_expr='gte')
    plot_dimensions = django_filters.CharFilter(field_name='plot_dimensions', lookup_expr='icontains')
    
    # Payment plan filters
    has_payment_plan = django_filters.BooleanFilter(method='filter_has_payment_plan')
    
    # Distance filters
    max_distance_to_road = django_filters.NumberFilter(method='filter_max_distance_to_road')

    class Meta:
        model = Property
        fields = {
            'property_type': ['exact'],
            'city': ['exact'],
            'state': ['exact'],
            'status': ['exact'],
        }

    # === FILTER METHODS FOR COMPLEX QUERIES ===
    
    def filter_location(self, queryset, name, value):
        """
        Search across multiple location fields
        """
        if value:
            return queryset.filter(
                Q(city__icontains=value) |
                Q(state__icontains=value) |
                Q(address__icontains=value) |
                Q(landmarks__icontains=value) |
                Q(zip_code__icontains=value)
            )
        return queryset

    def filter_has_title_deed(self, queryset, name, value):
        """
        Filter properties that have title deed status set
        """
        if value:
            return queryset.filter(title_deed_status__isnull=False)
        return queryset

    def filter_has_water(self, queryset, name, value):
        """
        Filter properties with any water supply
        """
        if value:
            return queryset.filter(
                Q(has_borehole=True) | 
                Q(has_piped_water=True) | 
                Q(water_supply_types__len__gt=0)
            )
        return queryset

    def filter_has_electricity(self, queryset, name, value):
        """
        Filter properties with electricity available on site or nearby
        """
        if value:
            return queryset.filter(
                electricity_availability__in=['on_site', 'nearby']
            )
        return queryset

    def filter_has_road_access(self, queryset, name, value):
        """
        Filter properties with road access (any type)
        """
        if value:
            return queryset.filter(
                Q(road_access_type__isnull=False) & 
                ~Q(road_access_type='')
            )
        return queryset

    def filter_road_access_type(self, queryset, name, value):
        """
        Filter by specific road access types
        """
        if value:
            # Handle both single values and lists
            if not isinstance(value, (list, tuple)):
                value = [value]
            
            # Build Q objects for each road type
            q_objects = Q()
            for road_type in value:
                q_objects |= Q(road_access_type__icontains=road_type)
            
            return queryset.filter(q_objects)
        return queryset

    def filter_topography(self, queryset, name, value):
        """
        Filter by topography types
        """
        if value:
            if not isinstance(value, (list, tuple)):
                value = [value]
            
            q_objects = Q()
            for topography_type in value:
                q_objects |= Q(topography__icontains=topography_type)
            
            return queryset.filter(q_objects)
        return queryset

    def filter_soil_type(self, queryset, name, value):
        """
        Filter by soil types
        """
        if value:
            if not isinstance(value, (list, tuple)):
                value = [value]
            
            q_objects = Q()
            for soil in value:
                q_objects |= Q(soil_type__icontains=soil)
            
            return queryset.filter(q_objects)
        return queryset

    def filter_has_payment_plan(self, queryset, name, value):
        """
        Filter properties that have payment plans available
        """
        if value:
            return queryset.filter(
                Q(payment_plan_details__isnull=False) & 
                ~Q(payment_plan_details='')
            )
        return queryset

    def filter_max_distance_to_road(self, queryset, name, value):
        """
        Filter properties within maximum distance to main road
        """
        if value:
            return queryset.filter(
                Q(distance_to_main_road__lte=value) |
                Q(distance_to_main_road__isnull=True)
            )
        return queryset

    # === PROPERTY TYPE AWARE FILTERING ===
    
    def filter_queryset(self, queryset):
        """
        Override to apply property-type specific filtering logic
        """
        queryset = super().filter_queryset(queryset)
        
        # Apply property-type aware filtering
        property_type = self.data.get('property_type')
        
        # If filtering for land properties, include land-specific filters
        if property_type == 'land' or (isinstance(property_type, list) and 'land' in property_type):
            # Ensure we're only applying land-relevant filters
            pass  # All land filters are already handled by individual filter methods
        
        # If filtering for non-land properties, exclude land-specific fields that don't apply
        elif property_type and property_type != 'land':
            # For non-land properties, we might want to exclude some land-specific filters
            # but keep the general ones that could apply (like location, price, etc.)
            pass
        
        return queryset

# === SPECIALIZED FILTER SETS FOR DIFFERENT USE CASES ===

class LandPropertyFilter(PropertyFilter):
    """
    Specialized filter set specifically for land properties
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Auto-filter to land properties only
        self.queryset = self.queryset.filter(property_type='land')

class ResidentialPropertyFilter(PropertyFilter):
    """
    Specialized filter set for residential properties
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Auto-filter to residential properties
        self.queryset = self.queryset.filter(property_type__in=['apartment', 'sale'])

class CommercialPropertyFilter(PropertyFilter):
    """
    Specialized filter set for commercial properties
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Auto-filter to commercial properties
        self.queryset = self.queryset.filter(property_type='commercial')

# === MAP-SPECIFIC FILTERS ===

class PropertyMapFilter(django_filters.FilterSet):
    """
    Lightweight filter set for map views - optimized for performance
    """
    property_type = django_filters.MultipleChoiceFilter(choices=Property.PROPERTY_TYPES)
    land_type = django_filters.MultipleChoiceFilter(choices=Property.LAND_TYPES)
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_size = django_filters.NumberFilter(field_name='size_acres', lookup_expr='gte')
    max_size = django_filters.NumberFilter(field_name='size_acres', lookup_expr='lte')
    city = django_filters.CharFilter(field_name='city', lookup_expr='exact')
    
    class Meta:
        model = Property
        fields = [
            'property_type', 'land_type', 'min_price', 'max_price', 
            'min_size', 'max_size', 'city'
        ]

# === SEARCH-SPECIFIC FILTERS ===

class PropertySearchFilter(django_filters.FilterSet):
    """
    Filter set specifically for search functionality
    """
    search = django_filters.CharFilter(method='filter_search')
    property_type = django_filters.MultipleChoiceFilter(choices=Property.PROPERTY_TYPES)
    land_type = django_filters.MultipleChoiceFilter(choices=Property.LAND_TYPES)
    
    class Meta:
        model = Property
        fields = ['search', 'property_type', 'land_type']
    
    def filter_search(self, queryset, name, value):
        """
        Comprehensive search across multiple fields
        """
        if value:
            return queryset.filter(
                Q(title__icontains=value) |
                Q(short_description__icontains=value) |
                Q(description__icontains=value) |
                Q(city__icontains=value) |
                Q(state__icontains=value) |
                Q(address__icontains=value) |
                Q(landmarks__icontains=value) |
                Q(zoning__icontains=value) |
                Q(plot_dimensions__icontains=value)
            )
        return queryset

# === ADMIN FILTERS ===

class AdminPropertyFilter(PropertyFilter):
    """
    Enhanced filter set for admin views with additional administrative filters
    """
    seller = django_filters.CharFilter(method='filter_seller')
    agent = django_filters.CharFilter(method='filter_agent')
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    has_media = django_filters.BooleanFilter(method='filter_has_media')
    has_documents = django_filters.BooleanFilter(method='filter_has_documents')
    
    class Meta:
        model = Property
        fields = {
            'property_type': ['exact'],
            'land_type': ['exact'],
            'city': ['exact'],
            'state': ['exact'],
            'status': ['exact'],
            'title_deed_status': ['exact'],
            'seller': ['exact'],
            'agent': ['exact'],
        }
    
    def filter_seller(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(seller__username__icontains=value) |
                Q(seller__email__icontains=value) |
                Q(seller__first_name__icontains=value) |
                Q(seller__last_name__icontains=value)
            )
        return queryset
    
    def filter_agent(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(agent__username__icontains=value) |
                Q(agent__email__icontains=value) |
                Q(agent__first_name__icontains=value) |
                Q(agent__last_name__icontains=value)
            )
        return queryset
    
    def filter_has_media(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(media__isnull=False) | Q(images__isnull=False)
            ).distinct()
        return queryset
    
    def filter_has_documents(self, queryset, name, value):
        if value:
            return queryset.filter(documents__isnull=False).distinct()
        return queryset