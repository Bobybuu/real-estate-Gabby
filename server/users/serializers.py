# users/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import SavedSearch, UserActivity, UserProfile, SellerApplication

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user',)
    
    def validate_preferred_locations(self, value):
        """Validate preferred locations is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Preferred locations must be a list")
        return value
    
    def validate_preferred_property_types(self, value):
        """Validate preferred property types is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Preferred property types must be a list")
        return value

class UserActivitySerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True)
    property_price = serializers.DecimalField(source='property.price', read_only=True, max_digits=12, decimal_places=2)
    property_image = serializers.SerializerMethodField()
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'activity_type', 'activity_type_display', 'property', 'property_title',
            'property_price', 'property_image', 'search_query', 'metadata', 'created_at'
        ]
        read_only_fields = ('user', 'created_at')
    
    def get_property_image(self, obj):
        if obj.property and obj.property.images.exists():
            return obj.property.images.first().image.url
        return None

class SavedSearchSerializer(serializers.ModelSerializer):
    result_count = serializers.SerializerMethodField()
    last_ran = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = SavedSearch
        fields = [
            'id', 'name', 'search_params', 'is_active', 'notification_frequency',
            'last_notified', 'result_count', 'last_ran', 'created_at', 'updated_at'
        ]
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def get_result_count(self, obj):
        # This would be implemented to count matching properties
        # You'll need to integrate with your property search
        return 0  # Placeholder

class SellerApplicationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_type = serializers.CharField(source='user.user_type', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = SellerApplication
        fields = [
            'id', 'user', 'user_name', 'user_email', 'user_type', 'status', 
            'status_display', 'application_data', 'submitted_at', 'reviewed_at',
            'reviewed_by', 'admin_notes'
        ]
        read_only_fields = ['user', 'submitted_at', 'reviewed_at', 'reviewed_by']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name',
            'last_name', 'user_type', 'phone_number', 'profile'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError("Passwords do not match")
        return attrs
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create or update profile
        if profile_data:
            profile_serializer = UserProfileSerializer(
                instance=user.profile, 
                data=profile_data, 
                partial=True
            )
            if profile_serializer.is_valid():
                profile_serializer.save()
        
        return user

class DashboardUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 
                 'phone_number', 'profile_image', 'is_verified', 'profile']

class EnhancedUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    favorites_count = serializers.SerializerMethodField()
    listings_count = serializers.SerializerMethodField()
    inquiries_count = serializers.SerializerMethodField()
    saved_searches_count = serializers.SerializerMethodField()
    has_pending_application = serializers.SerializerMethodField()
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'user_type', 'user_type_display', 'phone_number', 'profile_image', 
            'is_verified', 'company_name', 'license_number', 'bio', 
            'date_joined', 'created_at', 'updated_at',
            'profile', 'favorites_count', 'listings_count', 'inquiries_count',
            'saved_searches_count', 'has_pending_application'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at', 'is_verified']
    
    def get_favorites_count(self, obj):
        # Assuming you have a Favorite model or relationship
        return getattr(obj, 'favorite_properties', []).count()
    
    def get_listings_count(self, obj):
        # Assuming you have a Property model with creator foreign key
        if hasattr(obj, 'properties_created'):
            return obj.properties_created.count()
        return 0
    
    def get_inquiries_count(self, obj):
        # Assuming you have an Inquiry model
        if hasattr(obj, 'inquiries_made'):
            return obj.inquiries_made.count()
        return 0
    
    def get_saved_searches_count(self, obj):
        return obj.saved_searches.count()
    
    def get_has_pending_application(self, obj):
        return obj.seller_applications.filter(status='pending').exists()

class DashboardStatsSerializer(serializers.Serializer):
    # User Overview
    total_favorites = serializers.IntegerField(default=0)
    total_listings = serializers.IntegerField(default=0)
    total_inquiries = serializers.IntegerField(default=0)
    total_saved_searches = serializers.IntegerField(default=0)
    total_property_views = serializers.IntegerField(default=0)
    
    # Recent Activity
    recent_activities = UserActivitySerializer(many=True, read_only=True)
    
    # Notifications & Alerts
    unread_messages = serializers.IntegerField(default=0)
    pending_tours = serializers.IntegerField(default=0)
    new_matches = serializers.IntegerField(default=0)
    
    # Seller/Agent Specific
    active_listings = serializers.IntegerField(default=0)
    pending_listings = serializers.IntegerField(default=0)
    sold_listings = serializers.IntegerField(default=0)
    total_commission = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Application Status
    application_status = serializers.CharField(allow_null=True)
    application_details = SellerApplicationSerializer(read_only=True)

class UserUpdateSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'profile_image',
            'company_name', 'license_number', 'bio', 'profile'
        ]
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile if data provided
        if profile_data and hasattr(instance, 'profile'):
            profile_serializer = UserProfileSerializer(
                instance=instance.profile, 
                data=profile_data, 
                partial=True
            )
            if profile_serializer.is_valid():
                profile_serializer.save()
        
        return instance

class UserSearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user search results"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'user_type', 'profile_image']
    
    def get_full_name(self, obj):
        return obj.get_full_name()

# Maintain backward compatibility with your existing static serializers
class UserSerializer:
    @staticmethod
    def serialize(user):
        serializer = EnhancedUserSerializer(user)
        return serializer.data

class UserProfileSerializerStatic:
    @staticmethod
    def serialize(profile):
        if not profile:
            return {}
        serializer = UserProfileSerializer(profile)
        return serializer.data