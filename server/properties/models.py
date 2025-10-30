# properties/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import json

class Property(models.Model):
    PROPERTY_TYPES = [
        ('land', 'Land'),
        ('commercial', 'Commercial'),
        ('rental', 'Rental'),
        ('apartment', 'Apartment'),
        ('sale', 'For Sale'),
    ]
    
    LAND_TYPES = [
        ('residential', 'Residential'),
        ('agricultural', 'Agricultural'),
        ('commercial', 'Commercial'),
        ('industrial', 'Industrial'),
        ('mixed_use', 'Mixed Use'),
    ]
    
    TITLE_DEED_TYPES = [
        ('freehold', 'Freehold'),
        ('leasehold', 'Leasehold'),
        ('absentee', 'Absentee'),
        ('group_ranch', 'Group Ranch'),
        ('community_land', 'Community Land'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('published', 'Published'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
        ('under_offer', 'Under Offer'),
    ]
    
    # === BASIC INFORMATION ===
    title = models.CharField(max_length=200)
    short_description = models.CharField(max_length=255, blank=True, help_text="Brief description for listing cards")
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    land_type = models.CharField(max_length=20, choices=LAND_TYPES, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # === LOCATION & COORDINATES ===
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    landmarks = models.TextField(blank=True, help_text="Comma-separated nearby landmarks")
    
    # === PRICING & FINANCIAL DETAILS ===
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    price_unit = models.CharField(max_length=20, default='total')  # total, per_sqft, per_month, per_acre
    is_negotiable = models.BooleanField(default=False)
    price_per_unit = models.CharField(max_length=50, blank=True, help_text="e.g., 'per acre', 'per plot'")
    
    # Payment Plans
    payment_plan_details = models.TextField(blank=True, help_text="JSON or text describing installment plans")
    discount_offers = models.TextField(blank=True, help_text="Early bird, bulk purchase discounts")
    deposit_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Required deposit percentage")
    
    # === LAND-SPECIFIC DETAILS ===
    # Size Information
    size_acres = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    plot_dimensions = models.CharField(max_length=50, blank=True, help_text="e.g., '50x100ft', '100x100ft'")
    num_plots_available = models.IntegerField(default=1)
    total_plots = models.IntegerField(default=1, help_text="Total plots in the development")
    
    # Land Characteristics
    topography = models.CharField(max_length=100, blank=True, help_text="e.g., 'flat', 'gentle slope', 'hilly'")
    soil_type = models.CharField(max_length=50, blank=True, help_text="e.g., 'red soil', 'black cotton', 'sandy'")
    zoning = models.CharField(max_length=100, blank=True, help_text="Zoning classification")
    title_deed_status = models.CharField(max_length=20, choices=TITLE_DEED_TYPES, null=True, blank=True)
    
    # Development Status
    has_subdivision_approval = models.BooleanField(default=False)
    has_beacons = models.BooleanField(default=False, help_text="Boundary beacons in place")
    is_fenced = models.BooleanField(default=False)
    is_gated_community = models.BooleanField(default=False)
    
    # === INFRASTRUCTURE & UTILITIES ===
    # Road Access
    road_access_type = models.CharField(max_length=50, blank=True, help_text="e.g., 'tarmac', 'murram', 'gravel'")
    distance_to_main_road = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Distance in km")
    
    # Water Supply
    water_supply_types = models.JSONField(default=list, blank=True, help_text="List of water sources: ['borehole', 'piped', 'river', 'well']")
    has_borehole = models.BooleanField(default=False)
    has_piped_water = models.BooleanField(default=False)
    
    # Electricity
    electricity_availability = models.CharField(
        max_length=20, 
        choices=[
            ('on_site', 'On Site'),
            ('nearby', 'Nearby'),
            ('planned', 'Planned'),
            ('none', 'None')
        ], 
        default='none'
    )
    
    # Other Utilities
    has_sewer_system = models.BooleanField(default=False)
    has_drainage = models.BooleanField(default=False)
    internet_availability = models.BooleanField(default=False)
    
    # === PROPERTY DETAILS (Existing - Enhanced) ===
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    square_feet = models.IntegerField(null=True, blank=True)
    lot_size = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # acres
    year_built = models.IntegerField(null=True, blank=True)
    
    # === AMENITIES (Existing - Enhanced) ===
    has_garage = models.BooleanField(default=False)
    has_pool = models.BooleanField(default=False)
    has_garden = models.BooleanField(default=False)
    has_fireplace = models.BooleanField(default=False)
    has_central_air = models.BooleanField(default=False)
    
    # === RELATIONSHIPS ===
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='agent_properties')
    
    # === TIMESTAMPS ===
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # === METADATA ===
    featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    inquiry_count = models.IntegerField(default=0)
    
    class Meta:
        verbose_name_plural = "Properties"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property_type', 'status']),
            models.Index(fields=['land_type', 'status']),
            models.Index(fields=['price', 'status']),
            models.Index(fields=['city', 'status']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['created_at', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - ${self.price}"
    
    def get_landmarks_list(self):
        """Return landmarks as a list"""
        return [landmark.strip() for landmark in self.landmarks.split(',')] if self.landmarks else []
    
    def get_water_supply_types(self):
        """Return water supply types as list"""
        return self.water_supply_types if self.water_supply_types else []
    
    @property
    def is_land_property(self):
        """Check if this is a land property"""
        return self.property_type == 'land'
    
    @property
    def price_display(self):
        """Formatted price display"""
        if self.price_per_unit:
            return f"Ksh {self.price:,.0f} {self.price_per_unit}"
        return f"Ksh {self.price:,.0f}"

class PropertyMedia(models.Model):
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('drone', 'Drone Video'),
        ('site_plan', 'Site Plan'),
        ('aerial', 'Aerial Photo'),
        ('document', 'Document'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='media')
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
    file = models.FileField(upload_to='property_media/%Y/%m/%d/')
    video_url = models.URLField(blank=True, help_text="For embedded videos (YouTube, TikTok, Instagram)")
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['display_order', 'created_at']
        verbose_name_plural = "Property Media"
    
    def __str__(self):
        return f"{self.media_type} for {self.property.title}"

class Amenity(models.Model):
    CATEGORIES = [
        ('utilities', 'On-site Utilities'),
        ('accessibility', 'Accessibility'),
        ('surroundings', 'Surroundings'),
        ('characteristics', 'Land Characteristics'),
        ('security', 'Security'),
        ('community', 'Community Features'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    icon_code = models.CharField(max_length=20, blank=True, help_text="e.g., '⚡', '🚰', '🛣️'")
    description = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Amenities"
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class PropertyAmenity(models.Model):
    AVAILABILITY_CHOICES = [
        ('on_site', 'On Site'),
        ('nearby', 'Nearby'),
        ('planned', 'Planned'),
        ('not_available', 'Not Available'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='on_site')
    details = models.CharField(max_length=200, blank=True, help_text="e.g., '200m to tarmac road', '24/7 security'")
    
    class Meta:
        unique_together = ['property', 'amenity']
        verbose_name_plural = "Property Amenities"
    
    def __str__(self):
        return f"{self.property.title} - {self.amenity.name}"

class LegalDocument(models.Model):
    DOCUMENT_TYPES = [
        ('title_deed', 'Title Deed'),
        ('survey_map', 'Survey Map'),
        ('zoning_certificate', 'Zoning Certificate'),
        ('brochure', 'Brochure'),
        ('deed_plan', 'Deed Plan'),
        ('approval_letter', 'Approval Letter'),
        ('search_certificate', 'Search Certificate'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='property_documents/%Y/%m/%d/')
    description = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['document_type', 'created_at']
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.property.title}"

class PropertyContact(models.Model):
    property = models.OneToOneField(Property, on_delete=models.CASCADE, related_name='contact_info')
    agent_name = models.CharField(max_length=100)
    agent_phone = models.CharField(max_length=20)
    agent_email = models.EmailField(blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    alternative_contact = models.CharField(max_length=100, blank=True)
    office_address = models.TextField(blank=True)
    license_number = models.CharField(max_length=50, blank=True, help_text="Agent license number")
    
    class Meta:
        verbose_name_plural = "Property Contacts"
    
    def __str__(self):
        return f"Contact for {self.property.title}"

class Inquiry(models.Model):
    INQUIRY_TYPES = [
        ('property_inquiry', 'Property Inquiry'),
        ('valuation_request', 'Valuation Request'), 
        ('management_request', 'Management Request'),
        ('general_inquiry', 'General Inquiry'),
        ('site_visit', 'Site Visit Request'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('scheduled', 'Tour Scheduled'),
        ('closed', 'Closed'),
        ('converted', 'Converted to Sale'),
    ]
    
    SOURCE_CHOICES = [
        ('website', 'Website'),
        ('whatsapp', 'WhatsApp'),
        ('phone', 'Phone Call'),
        ('email', 'Email'),
        ('walk_in', 'Walk In'),
    ]
    
    # Make user and property optional for public inquiries
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='property_inquiries',
        null=True,
        blank=True
    )
    property = models.ForeignKey(
        Property, 
        on_delete=models.CASCADE, 
        related_name='inquiries',
        null=True,
        blank=True
    )
    
    # Contact information
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField()
    
    # Enhanced inquiry details
    inquiry_type = models.CharField(max_length=20, choices=INQUIRY_TYPES, default='property_inquiry')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='website')
    preferred_date = models.DateTimeField(null=True, blank=True)
    budget_range = models.CharField(max_length=100, blank=True, help_text="Client's budget range")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # Internal notes
    internal_notes = models.TextField(blank=True, help_text="Agent notes about the inquiry")
    assigned_agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_inquiries')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Inquiries"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['property', 'created_at']),
            models.Index(fields=['source', 'created_at']),
        ]
    
    def __str__(self):
        property_info = f" for {self.property.title}" if self.property else ""
        return f"{self.inquiry_type}{property_info} from {self.name}"

class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_properties')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'property']
    
    def __str__(self):
        return f"{self.user.username} - {self.property.title}"

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_images/%Y/%m/%d/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"Image for {self.property.title}"

# Signal handlers for data integrity
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

@receiver(pre_save, sender=PropertyMedia)
def set_primary_media(sender, instance, **kwargs):
    """Ensure only one primary media per property"""
    if instance.is_primary:
        PropertyMedia.objects.filter(property=instance.property, is_primary=True).update(is_primary=False)

@receiver(pre_save, sender=PropertyImage)
def set_primary_image(sender, instance, **kwargs):
    """Ensure only one primary image per property"""
    if instance.is_primary:
        PropertyImage.objects.filter(property=instance.property, is_primary=True).update(is_primary=False)

@receiver(post_save, sender=Inquiry)
def update_property_inquiry_count(sender, instance, created, **kwargs):
    """Update inquiry count on property when new inquiry is created"""
    if created and instance.property:
        instance.property.inquiry_count = instance.property.inquiries.count()
        instance.property.save()

# REMOVED: SavedSearch model - it already exists in users app
# class SavedSearch(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_searches')
#     name = models.CharField(max_length=100)
#     search_params = models.JSONField()
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     
#     def __str__(self):
#         return f"{self.user.username} - {self.name}"