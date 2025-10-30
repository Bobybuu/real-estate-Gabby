# properties/serializers.py
from rest_framework import serializers
from .models import (
    Property, PropertyImage, Favorite, Inquiry, 
    PropertyMedia, Amenity, PropertyAmenity, 
    LegalDocument, PropertyContact
)
from django.conf import settings

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'category', 'icon_code', 'description']

class PropertyAmenitySerializer(serializers.ModelSerializer):
    amenity = AmenitySerializer(read_only=True)
    amenity_id = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), 
        source='amenity',
        write_only=True
    )
    
    class Meta:
        model = PropertyAmenity
        fields = ['id', 'amenity', 'amenity_id', 'availability', 'details']

class PropertyMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PropertyMedia
        fields = [
            'id', 'media_type', 'file', 'file_url', 'thumbnail_url', 
            'video_url', 'caption', 'is_primary', 'display_order', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def get_thumbnail_url(self, obj):
        # For images, you might want to generate thumbnails
        # This is a placeholder for thumbnail logic
        if obj.file and obj.media_type == 'image':
            return obj.file.url
        return None

class LegalDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LegalDocument
        fields = [
            'id', 'document_type', 'file', 'file_url', 'file_name',
            'description', 'is_verified', 'verified_at', 'created_at'
        ]
        read_only_fields = ['verified_at', 'created_at']
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None

class PropertyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyContact
        fields = [
            'id', 'agent_name', 'agent_phone', 'agent_email',
            'whatsapp_number', 'alternative_contact', 
            'office_address', 'license_number'
        ]

class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'image_url', 'caption', 'is_primary', 'order']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class PropertyListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    amenities_preview = serializers.SerializerMethodField()
    price_display = serializers.CharField(source='get_price_display', read_only=True)
    location_display = serializers.SerializerMethodField()
    #is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'short_description', 'property_type', 'land_type', 
            'status', 'price', 'price_display', 'price_unit', 'is_negotiable',
            'price_per_unit', 'payment_plan_details', 'discount_offers', 'deposit_percentage',
            'size_acres', 'plot_dimensions', 'num_plots_available', 'total_plots',
            'city', 'state', 'location_display', 'landmarks',
            'topography', 'soil_type', 'zoning', 'title_deed_status',
            'has_subdivision_approval', 'has_beacons', 'is_fenced', 'is_gated_community',
            'road_access_type', 'distance_to_main_road',
            'water_supply_types', 'has_borehole', 'has_piped_water',
            'electricity_availability', 'has_sewer_system', 'has_drainage', 'internet_availability',
            'primary_image', 'seller_name', 'amenities_preview', 
            'created_at', 'featured', 'views_count', #'is_favorited'
        ]
    
    #def get_is_favorited(self, obj):
        #"""Check if the current user has favorited this property"""
       # request = self.context.get('request')
        #if request and request.user.is_authenticated:
        #    return obj.favorites.filter(user=request.user).exists()
        #return False
    
    def get_primary_image(self, obj):
        # First try PropertyMedia, then fall back to PropertyImage for backward compatibility
        primary_media = obj.media.filter(is_primary=True, media_type='image').first()
        if primary_media:
            return primary_media.file.url
        
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        return None
    
    def get_amenities_preview(self, obj):
        """Return first 3 amenities for card preview"""
        amenities = obj.amenities.select_related('amenity')[:3]
        return PropertyAmenitySerializer(amenities, many=True).data
    
    def get_location_display(self, obj):
        return f"{obj.city}, {obj.state}"

class PropertyMapSerializer(serializers.ModelSerializer):
    """Serializer for map view - optimized for performance"""
    price_display = serializers.CharField(source='get_price_display', read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'price', 'price_display', 'size_acres', 'land_type',
            'latitude', 'longitude', 'city', 'state', 'property_type',
            'has_borehole', 'has_piped_water', 'electricity_availability', 'road_access_type'
        ]

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    media = PropertyMediaSerializer(many=True, read_only=True)
    amenities = PropertyAmenitySerializer(many=True, read_only=True)
    documents = LegalDocumentSerializer(many=True, read_only=True)
    contact_info = PropertyContactSerializer(read_only=True)
    
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    agent_name = serializers.CharField(source='agent.get_full_name', read_only=True)
    
    # Computed fields
    price_display = serializers.CharField(source='get_price_display', read_only=True)
    landmarks_list = serializers.ListField(source='get_landmarks_list', read_only=True)
    water_supply_types = serializers.ListField(source='get_water_supply_types', read_only=True)
    is_land_property = serializers.BooleanField(read_only=True)
    
    # Write-only fields for creation/updates
    amenity_ids = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of amenities with format: [{'amenity_id': 1, 'availability': 'on_site', 'details': ''}]"
    )
    
    class Meta:
        model = Property
        fields = [
            # Basic Information
            'id', 'title', 'description', 'short_description', 'property_type', 'land_type',
            'status', 'address', 'city', 'state', 'zip_code', 'latitude', 'longitude', 
            'landmarks', 'landmarks_list',
            
            # Pricing & Financial
            'price', 'price_display', 'price_unit', 'is_negotiable', 'price_per_unit',
            'payment_plan_details', 'discount_offers', 'deposit_percentage',
            
            # Land Size & Details
            'size_acres', 'plot_dimensions', 'num_plots_available', 'total_plots',
            
            # Land Characteristics
            'topography', 'soil_type', 'zoning', 'title_deed_status',
            
            # Development Status
            'has_subdivision_approval', 'has_beacons', 'is_fenced', 'is_gated_community',
            
            # Infrastructure & Utilities
            'road_access_type', 'distance_to_main_road',
            'water_supply_types', 'has_borehole', 'has_piped_water',
            'electricity_availability', 'has_sewer_system', 'has_drainage', 'internet_availability',
            
            # Original Property Details
            'bedrooms', 'bathrooms', 'square_feet', 'lot_size', 'year_built',
            'has_garage', 'has_pool', 'has_garden', 'has_fireplace', 'has_central_air',
            
            # Relationships
            'seller', 'seller_name', 'agent', 'agent_name',
            'images', 'media', 'amenities', 'documents', 'contact_info',
            
            # Metadata
            'is_favorited', 'featured', 'views_count', 'inquiry_count',
            'created_at', 'updated_at', 'published_at',
            
            # Computed Properties
            'is_land_property',
            
            # Write-only fields
            'amenity_ids'
        ]
        read_only_fields = [
            'seller', 'created_at', 'updated_at', 'published_at', 
            'views_count', 'inquiry_count'
        ]
    
    def create(self, validated_data):
        amenity_data = validated_data.pop('amenity_ids', [])
        
        # Create property instance
        property_instance = Property.objects.create(**validated_data)
        
        # Create amenities
        self._create_or_update_amenities(property_instance, amenity_data)
        
        return property_instance
    
    def update(self, instance, validated_data):
        amenity_data = validated_data.pop('amenity_ids', [])
        
        # Update property instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update amenities if provided
        if amenity_data is not None:
            self._create_or_update_amenities(instance, amenity_data)
        
        return instance
    
    def _create_or_update_amenities(self, property_instance, amenity_data):
        """Helper method to handle amenity creation/updates"""
        if amenity_data:
            # Clear existing amenities and create new ones
            PropertyAmenity.objects.filter(property=property_instance).delete()
            
            for amenity_item in amenity_data:
                PropertyAmenity.objects.create(
                    property=property_instance,
                    amenity_id=amenity_item['amenity_id'],
                    availability=amenity_item.get('availability', 'on_site'),
                    details=amenity_item.get('details', '')
                )

class PropertyDetailSerializer(PropertySerializer):
    """Extended serializer for detailed property view with optimized queries"""
    
    # Additional computed fields for detail view
    similar_properties = serializers.SerializerMethodField()
    inquiry_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = '__all__'
    
    def get_similar_properties(self, obj):
        """Get similar properties based on location and type"""
        similar = Property.objects.filter(
            city=obj.city,
            property_type=obj.property_type,
            status='published'
        ).exclude(id=obj.id)[:4]
        
        return PropertyListSerializer(similar, many=True).data
    
    def get_inquiry_stats(self, obj):
        """Get inquiry statistics for the property"""
        inquiries = obj.inquiries.all()
        return {
            'total_inquiries': inquiries.count(),
            'new_inquiries': inquiries.filter(status='new').count(),
            'scheduled_tours': inquiries.filter(status='scheduled').count()
        }

class PropertyCreateSerializer(serializers.ModelSerializer):
    """Serializer specifically for property creation with validation"""
    
    class Meta:
        model = Property
        fields = [
            # Basic Information
            'title', 'short_description', 'description', 'property_type', 'land_type',
            'address', 'city', 'state', 'zip_code', 'latitude', 'longitude', 'landmarks',
            
            # Pricing & Financial
            'price', 'price_unit', 'is_negotiable', 'price_per_unit',
            'payment_plan_details', 'discount_offers', 'deposit_percentage',
            
            # Land Size & Details
            'size_acres', 'plot_dimensions', 'num_plots_available', 'total_plots',
            
            # Land Characteristics
            'topography', 'soil_type', 'zoning', 'title_deed_status',
            
            # Development Status
            'has_subdivision_approval', 'has_beacons', 'is_fenced', 'is_gated_community',
            
            # Infrastructure
            'road_access_type', 'distance_to_main_road',
            'water_supply_types', 'has_borehole', 'has_piped_water',
            'electricity_availability', 'has_sewer_system', 'has_drainage', 'internet_availability',
            
            # Original Property Fields (for backward compatibility)
            'bedrooms', 'bathrooms', 'square_feet', 'lot_size', 'year_built',
            'has_garage', 'has_pool', 'has_garden', 'has_fireplace', 'has_central_air',
            'featured'
        ]
    
    def validate(self, data):
        """Custom validation for property data"""
        if data.get('property_type') == 'land' and not data.get('land_type'):
            raise serializers.ValidationError({
                'land_type': 'Land type is required for land properties'
            })
        
        if data.get('size_acres') and data['size_acres'] <= 0:
            raise serializers.ValidationError({
                'size_acres': 'Size must be greater than 0'
            })
        
        if data.get('price') and data['price'] <= 0:
            raise serializers.ValidationError({
                'price': 'Price must be greater than 0'
            })
        
        return data

class FavoriteSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True)
    property_price = serializers.DecimalField(source='property.price', read_only=True, max_digits=12, decimal_places=2)
    property_city = serializers.CharField(source='property.city', read_only=True)
    property_type = serializers.CharField(source='property.property_type', read_only=True)
    property_image = serializers.SerializerMethodField()
    price_display = serializers.CharField(source='property.get_price_display', read_only=True)
    
    class Meta:
        model = Favorite
        fields = [
            'id', 'property', 'property_title', 'property_price', 'price_display',
            'property_city', 'property_type', 'property_image', 'created_at'
        ]
    
    def get_property_image(self, obj):
        primary_media = obj.property.media.filter(is_primary=True, media_type='image').first()
        if primary_media:
            return primary_media.file.url
        
        primary_image = obj.property.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        return None

class InquirySerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True, allow_null=True)
    property_price = serializers.DecimalField(
        source='property.price', read_only=True, 
        max_digits=12, decimal_places=2, allow_null=True
    )
    property_city = serializers.CharField(source='property.city', read_only=True, allow_null=True)
    property_image = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = Inquiry
        fields = [
            'id', 'property', 'property_title', 'property_price', 'property_city', 'property_image',
            'name', 'email', 'phone', 'message', 'inquiry_type', 'source', 'source_display',
            'preferred_date', 'budget_range', 'status', 'status_display',
            'internal_notes', 'assigned_agent', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'user', 'created_at', 'updated_at', 'assigned_agent'
        ]
    
    def get_property_image(self, obj):
        if obj.property:
            primary_media = obj.property.media.filter(is_primary=True, media_type='image').first()
            if primary_media:
                return primary_media.file.url
            
            primary_image = obj.property.images.filter(is_primary=True).first()
            if primary_image:
                return primary_image.image.url
        return None
    
    def create(self, validated_data):
        # Set the user if authenticated, otherwise leave as None for public inquiries
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        return super().create(validated_data)

class InquiryCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating inquiries (public form)"""
    
    class Meta:
        model = Inquiry
        fields = [
            'property', 'name', 'email', 'phone', 'message', 
            'inquiry_type', 'preferred_date', 'budget_range'
        ]
    
    def validate_property(self, value):
        """Ensure property is published"""
        if value and value.status != 'published':
            raise serializers.ValidationError("Cannot inquire about unpublished properties")
        return value

class PublicInquirySerializer(serializers.ModelSerializer):
    """Serializer for public inquiry form (no authentication required)"""
    
    class Meta:
        model = Inquiry
        fields = [
            'property', 'name', 'email', 'phone', 'message',
            'inquiry_type', 'preferred_date', 'budget_range'
        ]
    
    def create(self, validated_data):
        # Set source as website for public inquiries
        validated_data['source'] = 'website'
        return Inquiry.objects.create(**validated_data)

class AmenityCategorySerializer(serializers.Serializer):
    """Serializer for categorized amenities"""
    category = serializers.CharField()
    category_display = serializers.CharField(source='get_category_display')
    amenities = AmenitySerializer(many=True)

class PropertySearchSerializer(serializers.Serializer):
    """Serializer for property search parameters"""
    search = serializers.CharField(required=False)
    min_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    min_size = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_size = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    land_type = serializers.ListField(child=serializers.CharField(), required=False)
    property_type = serializers.ListField(child=serializers.CharField(), required=False)
    location = serializers.CharField(required=False)
    amenities = serializers.ListField(child=serializers.IntegerField(), required=False)
    has_title_deed = serializers.BooleanField(required=False)
    has_water = serializers.BooleanField(required=False)
    has_electricity = serializers.BooleanField(required=False)
    
    def validate(self, data):
        """Validate search parameters"""
        if data.get('min_price') and data.get('max_price'):
            if data['min_price'] > data['max_price']:
                raise serializers.ValidationError({
                    'min_price': 'Minimum price cannot be greater than maximum price'
                })
        
        if data.get('min_size') and data.get('max_size'):
            if data['min_size'] > data['max_size']:
                raise serializers.ValidationError({
                    'min_size': 'Minimum size cannot be greater than maximum size'
                })
        
        return data

class PropertyStatsSerializer(serializers.Serializer):
    """Serializer for property statistics"""
    total_properties = serializers.IntegerField()
    published_properties = serializers.IntegerField()
    land_properties = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_inquiries = serializers.IntegerField()
    average_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    price_range = serializers.DictField()