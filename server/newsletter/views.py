from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required

from .models import NewsletterSubscriber, PopupDismissal, EmailTemplate, NewsletterCampaign, EmailLog
from .serializers import (
    NewsletterSubscriptionSerializer, 
    PopupDismissalSerializer,
    NewsletterUnsubscribeSerializer,
    EmailTemplateSerializer,
    NewsletterCampaignSerializer,
    EmailLogSerializer,
    SendTestEmailSerializer,
    NewsletterSubscriberSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe_newsletter(request):
    """Subscribe to newsletter with SES integration"""
    serializer = NewsletterSubscriptionSerializer(data=request.data)
    
    if serializer.is_valid():
        subscriber = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Successfully subscribed to our newsletter! Welcome email sent.',
            'data': NewsletterSubscriberSerializer(subscriber).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def unsubscribe_newsletter(request):
    """Unsubscribe from newsletter using token or email"""
    serializer = NewsletterUnsubscribeSerializer(data=request.data)
    
    if serializer.is_valid():
        subscriber = serializer.validated_data['subscriber']
        subscriber.unsubscribe()
        
        return Response({
            'success': True,
            'message': 'Successfully unsubscribed from our newsletter.'
        })
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def unsubscribe_by_token(request, token):
    """Unsubscribe using token from email link"""
    try:
        subscriber = NewsletterSubscriber.objects.get(token=token, is_active=True)
        subscriber.unsubscribe()
        
        return Response({
            'success': True,
            'message': 'You have been successfully unsubscribed from our newsletter.',
            'email': subscriber.email
        })
    except NewsletterSubscriber.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Invalid unsubscribe link or already unsubscribed.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def dismiss_popup(request):
    """Dismiss newsletter popup for 3 days"""
    session_key = request.data.get('session_key')
    
    if not session_key:
        return Response({
            'success': False,
            'message': 'Session key is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create or update dismissal record
    dismissal, created = PopupDismissal.objects.update_or_create(
        session_key=session_key,
        user=request.user if request.user.is_authenticated else None,
        defaults={'dismissed_at': timezone.now()}
    )
    
    return Response({
        'success': True,
        'message': 'Popup dismissed for 3 days'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def check_popup_status(request):
    """Check if popup should be shown"""
    session_key = request.GET.get('session_key')
    
    if not session_key:
        return Response({
            'show_popup': True,
            'message': 'No session key provided'
        })
    
    # Check for valid dismissal
    dismissal = PopupDismissal.objects.filter(
        session_key=session_key,
        user=request.user if request.user.is_authenticated else None
    ).first()
    
    if dismissal and dismissal.is_valid():
        show_popup = False
    else:
        show_popup = True
    
    return Response({
        'show_popup': show_popup,
        'dismissed_at': dismissal.dismissed_at.isoformat() if dismissal else None
    })


# Admin Views
@api_view(['GET'])
@permission_classes([IsAdminUser])
def email_templates_list(request):
    """List all email templates"""
    templates = EmailTemplate.objects.all()
    serializer = EmailTemplateSerializer(templates, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAdminUser])
def email_template_detail(request, template_type):
    """Get or update specific email template"""
    try:
        template = EmailTemplate.objects.get(template_type=template_type)
    except EmailTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=404)
    
    if request.method == 'GET':
        serializer = EmailTemplateSerializer(template)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = EmailTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_test_email(request):
    """Send test email to preview templates"""
    serializer = SendTestEmailSerializer(data=request.data)
    
    if serializer.is_valid():
        template_type = serializer.validated_data['template_type']
        test_email = serializer.validated_data['test_email']
        
        try:
            # Create temporary subscriber for testing
            test_subscriber = NewsletterSubscriber(
                email=test_email,
                name="Test User"
            )
            
            # Send using the template system
            success = test_subscriber.send_template_email(template_type)
            
            if success:
                return Response({
                    'success': True,
                    'message': f'Test email sent to {test_email}'
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to send test email'
                }, status=500)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error sending test email: {str(e)}'
            }, status=500)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=400)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def subscriber_list(request):
    """List all subscribers (admin only)"""
    subscribers = NewsletterSubscriber.objects.all().order_by('-subscribed_at')
    serializer = NewsletterSubscriberSerializer(subscribers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def subscriber_stats(request):
    """Get newsletter statistics"""
    total_subscribers = NewsletterSubscriber.objects.count()
    active_subscribers = NewsletterSubscriber.objects.filter(is_active=True).count()
    recent_subscribers = NewsletterSubscriber.objects.filter(
        subscribed_at__gte=timezone.now() - timezone.timedelta(days=30)
    ).count()
    
    return Response({
        'total_subscribers': total_subscribers,
        'active_subscribers': active_subscribers,
        'recent_subscribers': recent_subscribers,
        'inactive_subscribers': total_subscribers - active_subscribers
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def email_logs(request):
    """Get email sending logs"""
    logs = EmailLog.objects.all().order_by('-sent_at')[:100]  # Last 100 emails
    serializer = EmailLogSerializer(logs, many=True)
    return Response(serializer.data)


# Legacy endpoint for backward compatibility
@csrf_exempt
def newsletter_subscribe_legacy(request):
    """Legacy endpoint for form submissions"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({
                    'success': False,
                    'message': 'Email is required'
                }, status=400)
            
            # Use serializer for consistency
            serializer = NewsletterSubscriptionSerializer(data={'email': email})
            
            if serializer.is_valid():
                subscriber = serializer.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Successfully subscribed to newsletter!'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': serializer.errors.get('email', ['Invalid email'])[0]
                }, status=400)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'message': 'Method not allowed'
    }, status=405)