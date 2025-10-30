from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import (
    NewsletterSubscriber, 
    PopupDismissal, 
    NewsletterCampaign,
    EmailTemplate,
    EmailLog
)

@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'is_active', 'subscribed_at', 'unsubscribed_at', 'token_short')
    list_filter = ('is_active', 'subscribed_at', 'unsubscribed_at')
    search_fields = ('email', 'name', 'user__username', 'user__email')
    readonly_fields = ('subscribed_at', 'unsubscribed_at', 'token', 'token_short')
    list_per_page = 50
    actions = ['activate_subscribers', 'deactivate_subscribers', 'send_welcome_emails']
    
    fieldsets = (
        ('Subscriber Information', {
            'fields': ('email', 'name', 'user', 'is_active')
        }),
        ('Security', {
            'fields': ('token', 'token_short'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('subscribed_at', 'unsubscribed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def token_short(self, obj):
        return str(obj.token)[:8] + '...' if obj.token else '-'
    token_short.short_description = 'Token'
    
    def activate_subscribers(self, request, queryset):
        updated = queryset.update(is_active=True, unsubscribed_at=None)
        self.message_user(request, f'{updated} subscribers activated.')
    activate_subscribers.short_description = "Activate selected subscribers"
    
    def deactivate_subscribers(self, request, queryset):
        updated = queryset.update(is_active=False, unsubscribed_at=timezone.now())
        self.message_user(request, f'{updated} subscribers deactivated.')
    deactivate_subscribers.short_description = "Deactivate selected subscribers"
    
    def send_welcome_emails(self, request, queryset):
        sent_count = 0
        for subscriber in queryset.filter(is_active=True):
            if subscriber.send_welcome_email():
                sent_count += 1
        self.message_user(request, f'{sent_count} welcome emails sent successfully.')
    send_welcome_emails.short_description = "Send welcome emails to selected subscribers"


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'is_active', 'updated_at')
    list_filter = ('template_type', 'is_active', 'created_at', 'updated_at')
    search_fields = ('name', 'subject', 'html_content')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_active',)
    
    fieldsets = (
        ('Template Information', {
            'fields': ('name', 'template_type', 'is_active')
        }),
        ('Content', {
            'fields': ('subject', 'html_content', 'plain_text_content')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('template_type',)
        return self.readonly_fields


@admin.register(NewsletterCampaign)
class NewsletterCampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'template', 'sent_at', 'created_at', 'is_sent_display')
    list_filter = ('sent_at', 'created_at', 'template')
    search_fields = ('title', 'subject', 'content')
    readonly_fields = ('created_at', 'sent_at', 'is_sent_display')
    actions = ['send_campaigns']
    
    fieldsets = (
        ('Campaign Details', {
            'fields': ('title', 'subject', 'content', 'template')
        }),
        ('Delivery Information', {
            'fields': ('sent_at', 'is_sent_display', 'scheduled_for'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def is_sent_display(self, obj):
        return obj.is_sent
    is_sent_display.boolean = True
    is_sent_display.short_description = 'Sent'
    
    def send_campaigns(self, request, queryset):
        sent_count = 0
        for campaign in queryset.filter(sent_at__isnull=True):
            if campaign.send_campaign():
                sent_count += 1
        self.message_user(request, f'{sent_count} campaigns sent successfully.')
    send_campaigns.short_description = "Send selected campaigns"


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ('subscriber_email', 'template_name', 'campaign_title', 'sent_at', 'status_display')
    list_filter = ('status', 'sent_at', 'template', 'campaign')
    search_fields = ('subscriber__email', 'template__name', 'campaign__title', 'subject')
    readonly_fields = ('sent_at', 'message_id')
    list_per_page = 100
    
    fieldsets = (
        ('Email Information', {
            'fields': ('subscriber', 'template', 'campaign', 'subject')
        }),
        ('Delivery Status', {
            'fields': ('status', 'message_id', 'sent_at')
        }),
    )
    
    def subscriber_email(self, obj):
        return obj.subscriber.email
    subscriber_email.short_description = 'Subscriber'
    
    def template_name(self, obj):
        return obj.template.name if obj.template else '-'
    template_name.short_description = 'Template'
    
    def campaign_title(self, obj):
        return obj.campaign.title if obj.campaign else '-'
    campaign_title.short_description = 'Campaign'
    
    def status_display(self, obj):
        status_colors = {
            'sent': 'blue',
            'delivered': 'green', 
            'bounced': 'red',
            'complained': 'orange'
        }
        color = status_colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.status.upper()
        )
    status_display.short_description = 'Status'


@admin.register(PopupDismissal)
class PopupDismissalAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'user', 'dismissed_at', 'is_valid_display')
    list_filter = ('dismissed_at',)
    search_fields = ('session_key', 'user__username', 'user__email')
    readonly_fields = ('dismissed_at',)
    
    fieldsets = (
        ('Dismissal Information', {
            'fields': ('session_key', 'user')
        }),
        ('Timestamps', {
            'fields': ('dismissed_at',),
            'classes': ('collapse',)
        }),
    )
    
    def is_valid_display(self, obj):
        return obj.is_valid()
    is_valid_display.boolean = True
    is_valid_display.short_description = 'Valid (within 3 days)'


# Optional: Admin site customization (you can remove this if already in main admin.py)
admin.site.site_header = "PristinePrimier Real Estate Administration"
admin.site.site_title = "PristinePrimier Admin Portal"
admin.site.index_title = "Welcome to PristinePrimier Newsletter Management"