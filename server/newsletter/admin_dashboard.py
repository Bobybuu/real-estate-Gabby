from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.utils import timezone
from datetime import timedelta
from .models import NewsletterSubscriber, PopupDismissal

@staff_member_required
def newsletter_dashboard(request):
    """Custom admin dashboard for newsletter analytics"""
    
    # Basic stats
    total_subscribers = NewsletterSubscriber.objects.count()
    active_subscribers = NewsletterSubscriber.objects.filter(is_active=True).count()
    inactive_subscribers = NewsletterSubscriber.objects.filter(is_active=False).count()
    
    # Recent activity
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    new_this_week = NewsletterSubscriber.objects.filter(
        subscribed_at__date__gte=week_ago
    ).count()
    
    new_this_month = NewsletterSubscriber.objects.filter(
        subscribed_at__date__gte=month_ago
    ).count()
    
    # Popup dismissals
    recent_dismissals = PopupDismissal.objects.filter(
        dismissed_at__date__gte=week_ago
    ).count()
    
    context = {
        'total_subscribers': total_subscribers,
        'active_subscribers': active_subscribers,
        'inactive_subscribers': inactive_subscribers,
        'new_this_week': new_this_week,
        'new_this_month': new_this_month,
        'recent_dismissals': recent_dismissals,
        'subscriber_growth_rate': ((new_this_week / active_subscribers) * 100) if active_subscribers else 0,
    }
    
    return render(request, 'admin/newsletter_dashboard.html', context)