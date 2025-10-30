# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile, SellerApplication

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'date_joined')
    list_filter = ('user_type', 'is_verified', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('PristinePrimer Info', {
            'fields': ('user_type', 'phone_number', 'profile_image', 'is_verified', 'company_name', 'license_number', 'bio')
        }),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'city', 'state', 'country')
    search_fields = ('user__username', 'user__email', 'city', 'state')

@admin.register(SellerApplication)
class SellerApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'submitted_at', 'reviewed_at')
    list_filter = ('status', 'submitted_at')
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        for application in queryset:
            application.status = 'approved'
            application.reviewed_by = request.user
            application.save()
            # Activate seller privileges
            application.user.is_verified = True
            application.user.save()
    approve_applications.short_description = "Approve selected applications"
    
    def reject_applications(self, request, queryset):
        queryset.update(status='rejected', reviewed_by=request.user)
    reject_applications.short_description = "Reject selected applications"