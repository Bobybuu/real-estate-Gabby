from django.urls import path
from . import views

urlpatterns = [
    # Public subscription endpoints
    path('subscribe/', views.subscribe_newsletter, name='newsletter-subscribe'),
    path('unsubscribe/', views.unsubscribe_newsletter, name='newsletter-unsubscribe'),
    path('unsubscribe/<uuid:token>/', views.unsubscribe_by_token, name='unsubscribe-by-token'),
    
    # Popup management
    path('popup/dismiss/', views.dismiss_popup, name='popup-dismiss'),
    path('popup/status/', views.check_popup_status, name='popup-status'),
    
    # Legacy endpoint
    path('legacy/subscribe/', views.newsletter_subscribe_legacy, name='newsletter-subscribe-legacy'),
    
    # Admin endpoints
    path('admin/templates/', views.email_templates_list, name='email-templates-list'),
    path('admin/templates/<str:template_type>/', views.email_template_detail, name='email-template-detail'),
    path('admin/send-test-email/', views.send_test_email, name='send-test-email'),
    path('admin/subscribers/', views.subscriber_list, name='subscriber-list'),
    path('admin/stats/', views.subscriber_stats, name='subscriber-stats'),
    path('admin/email-logs/', views.email_logs, name='email-logs'),
]