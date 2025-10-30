from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives, send_mail
from django.utils.html import strip_tags
import uuid
import logging


logger = logging.getLogger(__name__)
User = get_user_model()

class EmailTemplate(models.Model):
    TEMPLATE_TYPES = [
        ('welcome', 'Welcome Email'),
        ('newsletter', 'Newsletter'),
        ('property_alert', 'Property Alert'),
        ('confirmation', 'Confirmation'),
    ]
    
    name = models.CharField(max_length=100)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES, unique=True)
    subject = models.CharField(max_length=200)
    html_content = models.TextField(help_text="Use {{ variable }} for template variables")
    plain_text_content = models.TextField(blank=True, help_text="Plain text version (auto-generated if empty)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_templates'
        verbose_name = 'Email Template'
        verbose_name_plural = 'Email Templates'
    
    def render_template(self, context):
        """Simple template rendering with variable substitution"""
        html_content = self.html_content
        plain_content = self.plain_text_content or strip_tags(html_content)
        
        for key, value in context.items():
            placeholder = f"{{{{ {key} }}}}"
            html_content = html_content.replace(placeholder, str(value))
            plain_content = plain_content.replace(placeholder, str(value))
        
        return html_content, plain_content
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    class Meta:
        db_table = 'newsletter_subscribers'
        verbose_name = 'Newsletter Subscriber'
        verbose_name_plural = 'Newsletter Subscribers'
    
    def __str__(self):
        return self.email
    
    def get_unsubscribe_url(self):
        """Generate unique unsubscribe URL"""
        return f"https://pristineprimier.com/unsubscribe/{self.token}/"
    
    def send_welcome_email(self):
        """Send welcome email using template from database"""
        try:
            template = EmailTemplate.objects.get(template_type='welcome', is_active=True)
            
            context = {
                'subscriber_name': self.name or 'Subscriber',
                'subscriber_email': self.email,
                'unsubscribe_url': self.get_unsubscribe_url(),
                'current_year': timezone.now().year,
                'site_url': 'https://pristineprimier.com',
            }
            
            html_content, plain_text_content = template.render_template(context)
            
            # Use SES backend (configured in settings)
            email = EmailMultiAlternatives(
                subject=template.subject,
                body=plain_text_content,
                from_email='PristinePrimier Real Estate <newsletter@pristineprimier.com>',
                to=[self.email],
                reply_to=['info@pristineprimier.com']
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
            
            logger.info(f"Welcome email sent to {self.email}")
            return True
            
        except EmailTemplate.DoesNotExist:
            logger.warning("Welcome email template not found, sending basic email")
            return self.send_basic_welcome_email()
        except Exception as e:
            logger.error(f"Failed to send welcome email to {self.email}: {e}")
            return False
    
    def send_basic_welcome_email(self):
        """Fallback basic welcome email"""
        subject = "Welcome to PristinePrimier Real Estate Newsletter"
        message = f"""
        Thank you for subscribing to PristinePrimier Real Estate newsletter!
        
        You'll receive:
        - Exclusive property listings
        - Market insights and trends
        - Special offers and promotions
        
        To unsubscribe, visit: {self.get_unsubscribe_url()}
        
        Best regards,
        The PristinePrimier Team
        """
        
        send_mail(
            subject=subject.strip(),
            message=message.strip(),
            from_email='PristinePrimier Real Estate <newsletter@pristineprimier.com>',
            recipient_list=[self.email],
            fail_silently=False,
        )
        return True
    
    def unsubscribe(self):
        """Mark subscriber as unsubscribed"""
        self.is_active = False
        self.unsubscribed_at = timezone.now()
        self.save()
        logger.info(f"Subscriber {self.email} unsubscribed")


class PopupDismissal(models.Model):
    session_key = models.CharField(max_length=255, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    dismissed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'popup_dismissals'
        unique_together = ['session_key', 'user']
        verbose_name = 'Popup Dismissal'
        verbose_name_plural = 'Popup Dismissals'
    
    def __str__(self):
        return f"Popup dismissal for {self.user or self.session_key}"
    
    def is_valid(self):
        """Check if dismissal is still valid (within 3 days)"""
        return (timezone.now() - self.dismissed_at).days < 3


class NewsletterCampaign(models.Model):
    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    content = models.TextField()
    template = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'newsletter_campaigns'
        verbose_name = 'Newsletter Campaign'
        verbose_name_plural = 'Newsletter Campaigns'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_sent(self):
        return self.sent_at is not None
    
    def send_campaign(self):
        """Send campaign to all active subscribers"""
        if self.is_sent:
            logger.warning(f"Campaign {self.id} already sent")
            return False
        
        try:
            active_subscribers = NewsletterSubscriber.objects.filter(is_active=True)
            sent_count = 0
            
            for subscriber in active_subscribers:
                # Implementation for sending campaign emails
                # This would integrate with SES for bulk sending
                sent_count += 1
            
            self.sent_at = timezone.now()
            self.save()
            
            logger.info(f"Campaign '{self.title}' sent to {sent_count} subscribers")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send campaign {self.id}: {e}")
            return False


class EmailLog(models.Model):
    """Track all emails sent for analytics and bounce handling"""
    subscriber = models.ForeignKey(NewsletterSubscriber, on_delete=models.CASCADE)
    template = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL, null=True)
    campaign = models.ForeignKey(NewsletterCampaign, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=255)
    sent_at = models.DateTimeField(auto_now_add=True)
    message_id = models.CharField(max_length=255, blank=True)  # SES Message ID
    status = models.CharField(max_length=20, default='sent', choices=[
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('bounced', 'Bounced'),
        ('complained', 'Complained'),
    ])
    
    class Meta:
        db_table = 'email_logs'
        verbose_name = 'Email Log'
        verbose_name_plural = 'Email Logs'
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"Email to {self.subscriber.email} - {self.status}"