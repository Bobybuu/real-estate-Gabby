# properties/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Property, PropertyImage, Favorite, Inquiry,
    PropertyMedia, Amenity, PropertyAmenity, 
    LegalDocument, PropertyContact
)

# ===== INLINE ADMIN CLASSES =====

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ['image', 'image_preview', 'caption', 'is_primary', 'order']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Preview'

class PropertyMediaInline(admin.TabularInline):
    model = PropertyMedia
    extra = 1
    fields = ['media_type', 'file', 'file_preview', 'video_url', 'caption', 'is_primary', 'display_order']
    readonly_fields = ['file_preview']
    
    def file_preview(self, obj):
        if obj.file and obj.media_type == 'image':
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />', obj.file.url)
        elif obj.media_type == 'video':
            return "🎥 Video"
        elif obj.media_type == 'drone':
            return "🚁 Drone Video"
        elif obj.media_type == 'aerial':
            return "🛰️ Aerial"
        return "📄 File"
    file_preview.short_description = 'Preview'

class PropertyAmenityInline(admin.TabularInline):
    model = PropertyAmenity
    extra = 1
    fields = ['amenity', 'availability', 'details']
    autocomplete_fields = ['amenity']

class LegalDocumentInline(admin.TabularInline):
    model = LegalDocument
    extra = 1
    fields = ['document_type', 'file', 'is_verified', 'verified_at', 'description']
    readonly_fields = ['verified_at']

class PropertyContactInline(admin.StackedInline):
    model = PropertyContact
    extra = 1
    fields = ['agent_name', 'agent_phone', 'agent_email', 'whatsapp_number', 'alternative_contact', 'office_address', 'license_number']

# ===== MAIN ADMIN CLASSES =====

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'property_type', 'land_type', 'price_display', 
        'city', 'state', 'size_display', 'status', 'featured', 
        'has_title_deed', 'created_at', 'admin_actions'
    ]
    list_filter = [
        'property_type', 'land_type', 'status', 'featured', 
        'city', 'state', 'title_deed_status', 'is_negotiable',
        'has_subdivision_approval', 'has_beacons', 'is_fenced',
        'electricity_availability', 'created_at', 'updated_at'
    ]
    search_fields = [
        'title', 'short_description', 'description', 'address', 
        'city', 'state', 'zip_code', 'landmarks', 'seller__username', 
        'seller__email', 'agent__username'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'published_at', 
        'views_count', 'inquiry_count', 'landmarks_list',
        'water_supply_types_list', 'is_land_property'
    ]
    list_editable = ['status', 'featured']
    list_per_page = 50
    inlines = [PropertyImageInline, PropertyMediaInline, PropertyAmenityInline, LegalDocumentInline, PropertyContactInline]
    actions = [
        'make_published', 'make_featured', 'make_draft', 
        'approve_subdivision', 'mark_has_title_deed'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'short_description', 'description', 
                'property_type', 'land_type', 'status'
            )
        }),
        ('Location & Coordinates', {
            'fields': (
                'address', 'city', 'state', 'zip_code', 
                'latitude', 'longitude', 'landmarks'
            )
        }),
        ('Pricing & Financial', {
            'fields': (
                'price', 'price_unit', 'is_negotiable', 'price_per_unit',
                'payment_plan_details', 'discount_offers', 'deposit_percentage'
            )
        }),
        ('Land Details & Size', {
            'fields': (
                'size_acres', 'plot_dimensions', 'num_plots_available', 'total_plots',
                'topography', 'soil_type', 'zoning'
            )
        }),
        ('Infrastructure & Utilities', {
            'fields': (
                'road_access_type', 'distance_to_main_road',
                'water_supply_types', 'has_borehole', 'has_piped_water',
                'electricity_availability', 'has_sewer_system', 
                'has_drainage', 'internet_availability'
            )
        }),
        ('Development Status', {
            'fields': (
                'has_subdivision_approval', 'has_beacons', 'is_fenced', 
                'is_gated_community'
            )
        }),
        ('Legal & Title Information', {
            'fields': (
                'title_deed_status', 
            )
        }),
        ('Property Details (Existing)', {
            'fields': (
                'bedrooms', 'bathrooms', 'square_feet', 'lot_size', 'year_built'
            ),
            'classes': ('collapse',)
        }),
        ('Amenities (Existing)', {
            'fields': (
                'has_garage', 'has_pool', 'has_garden', 'has_fireplace', 'has_central_air'
            ),
            'classes': ('collapse',)
        }),
        ('Relationships', {
            'fields': ('seller', 'agent')
        }),
        ('Metadata & Analytics', {
            'fields': (
                'featured', 'views_count', 'inquiry_count', 
                'created_at', 'updated_at', 'published_at',
                'is_land_property', 'landmarks_list', 'water_supply_types_list'
            )
        }),
    )
    
    # Custom methods for list display
    def price_display(self, obj):
        return obj.price_display
    price_display.short_description = 'Price'
    
    def size_display(self, obj):
        if obj.size_acres:
            return f"{obj.size_acres} acres"
        return "-"
    size_display.short_description = 'Size'
    
    def has_title_deed(self, obj):
        return obj.title_deed_status is not None
    has_title_deed.boolean = True
    has_title_deed.short_description = 'Title Deed'
    
    def admin_actions(self, obj):
        return format_html(
            '<a href="{}">View</a> | <a href="{}">Edit</a>',
            reverse('admin:properties_property_change', args=[obj.id]),
            reverse('admin:properties_property_change', args=[obj.id])
        )
    admin_actions.short_description = 'Actions'
    
    # Computed fields for display
    def landmarks_list(self, obj):
        return ", ".join(obj.get_landmarks_list()) if obj.landmarks else "None"
    landmarks_list.short_description = 'Landmarks (List)'
    
    def water_supply_types_list(self, obj):
        return ", ".join(obj.get_water_supply_types()) if obj.water_supply_types else "None"
    water_supply_types_list.short_description = 'Water Sources'
    
    # Admin actions
    def make_published(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(request, f'{updated} properties marked as published.')
    make_published.short_description = "Mark selected properties as published"
    
    def make_featured(self, request, queryset):
        updated = queryset.update(featured=True)
        self.message_user(request, f'{updated} properties marked as featured.')
    make_featured.short_description = "Mark selected properties as featured"
    
    def make_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} properties marked as draft.')
    make_draft.short_description = "Mark selected properties as draft"
    
    def approve_subdivision(self, request, queryset):
        updated = queryset.update(has_subdivision_approval=True)
        self.message_user(request, f'{updated} properties marked with subdivision approval.')
    approve_subdivision.short_description = "Approve subdivision for selected properties"
    
    def mark_has_title_deed(self, request, queryset):
        updated = queryset.filter(title_deed_status__isnull=True).update(title_deed_status='freehold')
        self.message_user(request, f'{updated} properties marked with title deed.')
    mark_has_title_deed.short_description = "Add title deed to selected properties"

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['property', 'image_preview', 'is_primary', 'order']
    list_filter = ['is_primary', 'created_at']
    list_editable = ['is_primary', 'order']
    search_fields = ['property__title', 'caption']
    readonly_fields = ['created_at']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.allow_tags = True
    image_preview.short_description = 'Preview'

@admin.register(PropertyMedia)
class PropertyMediaAdmin(admin.ModelAdmin):
    list_display = ['property', 'media_type', 'file_preview', 'video_url', 'is_primary', 'display_order']
    list_filter = ['media_type', 'is_primary', 'created_at']
    list_editable = ['is_primary', 'display_order']
    search_fields = ['property__title', 'caption', 'video_url']
    readonly_fields = ['created_at', 'file_preview']
    
    def file_preview(self, obj):
        if obj.file and obj.media_type == 'image':
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />', obj.file.url)
        elif obj.media_type == 'video':
            return "🎥 Video"
        elif obj.media_type == 'drone':
            return "🚁 Drone Video"
        elif obj.media_type == 'aerial':
            return "🛰️ Aerial"
        elif obj.media_type == 'site_plan':
            return "📐 Site Plan"
        return "📄 File"
    file_preview.short_description = 'Preview'

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'icon_display', 'is_active']
    list_filter = ['category', 'is_active']
    list_editable = ['is_active']
    search_fields = ['name', 'description']
    actions = ['activate_amenities', 'deactivate_amenities']
    
    def icon_display(self, obj):
        return obj.icon_code if obj.icon_code else "—"
    icon_display.short_description = 'Icon'
    
    def activate_amenities(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} amenities activated.')
    activate_amenities.short_description = "Activate selected amenities"
    
    def deactivate_amenities(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} amenities deactivated.')
    deactivate_amenities.short_description = "Deactivate selected amenities"

@admin.register(PropertyAmenity)
class PropertyAmenityAdmin(admin.ModelAdmin):
    list_display = ['property', 'amenity', 'availability', 'details']
    list_filter = ['availability', 'amenity__category']
    search_fields = ['property__title', 'amenity__name', 'details']
    autocomplete_fields = ['property', 'amenity']

@admin.register(LegalDocument)
class LegalDocumentAdmin(admin.ModelAdmin):
    list_display = ['property', 'document_type', 'file_link', 'is_verified', 'verified_at']
    list_filter = ['document_type', 'is_verified', 'verified_at', 'created_at']
    list_editable = ['is_verified']
    search_fields = ['property__title', 'description']
    readonly_fields = ['verified_at', 'created_at']
    actions = ['verify_documents', 'unverify_documents']
    
    def file_link(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">📄 Download</a>', obj.file.url)
        return "No file"
    file_link.short_description = 'File'
    
    def verify_documents(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} documents verified.')
    verify_documents.short_description = "Verify selected documents"
    
    def unverify_documents(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'{updated} documents unverified.')
    unverify_documents.short_description = "Unverify selected documents"

@admin.register(PropertyContact)
class PropertyContactAdmin(admin.ModelAdmin):
    list_display = ['property', 'agent_name', 'agent_phone', 'agent_email', 'whatsapp_number']
    search_fields = ['property__title', 'agent_name', 'agent_phone', 'agent_email']
    #list_filter = ['created_at']

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'property', 'property_city', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email', 'property__title', 'property__city']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    def property_city(self, obj):
        return obj.property.city
    property_city.short_description = 'Property City'

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = [
        'property', 'name', 'email', 'phone', 'inquiry_type', 
        'source', 'status', 'created_at', 'assigned_agent'
    ]
    list_filter = ['inquiry_type', 'source', 'status', 'created_at']
    search_fields = ['name', 'email', 'phone', 'property__title', 'message']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['status']
    date_hierarchy = 'created_at'
    actions = ['mark_as_contacted', 'mark_as_closed', 'mark_as_new']
    
    fieldsets = (
        ('Inquiry Details', {
            'fields': ('property', 'user', 'name', 'email', 'phone', 'message')
        }),
        ('Inquiry Type & Source', {
            'fields': ('inquiry_type', 'source', 'preferred_date', 'budget_range')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'assigned_agent', 'internal_notes')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def mark_as_contacted(self, request, queryset):
        updated = queryset.update(status='contacted')
        self.message_user(request, f'{updated} inquiries marked as contacted.')
    mark_as_contacted.short_description = "Mark selected inquiries as contacted"
    
    def mark_as_closed(self, request, queryset):
        updated = queryset.update(status='closed')
        self.message_user(request, f'{updated} inquiries marked as closed.')
    mark_as_closed.short_description = "Mark selected inquiries as closed"
    
    def mark_as_new(self, request, queryset):
        updated = queryset.update(status='new')
        self.message_user(request, f'{updated} inquiries marked as new.')
    mark_as_new.short_description = "Mark selected inquiries as new"
    
    


# ===== ADMIN SITE CONFIGURATION =====

admin.site.site_header = "PristinePrimer Real Estate Admin"
admin.site.site_title = "PristinePrimer Admin"
admin.site.index_title = "Real Estate Management"