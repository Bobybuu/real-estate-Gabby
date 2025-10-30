from rest_framework import serializers
from .models import NewsletterSubscriber, PopupDismissal, EmailTemplate, NewsletterCampaign, EmailLog

class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['email', 'name']
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True}
        }
    
    def validate_email(self, value):
        """Validate email and check for existing active subscriptions"""
        # Check if email is already subscribed and active
        if NewsletterSubscriber.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("This email is already subscribed to our newsletter.")
        return value
    
    def create(self, validated_data):
        """Create subscriber and send welcome email"""
        # Check if email exists but is inactive (resubscribe)
        subscriber, created = NewsletterSubscriber.objects.get_or_create(
            email=validated_data['email'],
            defaults=validated_data
        )
        
        if not created and not subscriber.is_active:
            # Resubscribe existing inactive subscriber
            subscriber.is_active = True
            subscriber.unsubscribed_at = None
            subscriber.name = validated_data.get('name', subscriber.name)
            subscriber.save()
        elif created:
            # New subscriber - send welcome email
            try:
                subscriber.send_welcome_email()
            except Exception as e:
                # Log error but don't fail the subscription
                print(f"Failed to send welcome email: {e}")
        
        return subscriber


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    """Serializer for admin/list views"""
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'name', 'is_active', 'subscribed_at', 'unsubscribed_at', 'token']


class PopupDismissalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopupDismissal
        fields = ['session_key', 'user']
        extra_kwargs = {
            'user': {'required': False, 'allow_null': True}
        }


class NewsletterUnsubscribeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.UUIDField(required=False)
    
    def validate(self, data):
        """Validate unsubscribe request"""
        email = data['email']
        token = data.get('token')
        
        try:
            if token:
                subscriber = NewsletterSubscriber.objects.get(email=email, token=token)
            else:
                subscriber = NewsletterSubscriber.objects.get(email=email, is_active=True)
            
            data['subscriber'] = subscriber
            return data
            
        except NewsletterSubscriber.DoesNotExist:
            raise serializers.ValidationError("Subscriber not found or already unsubscribed.")


class EmailTemplateSerializer(serializers.ModelSerializer):
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    
    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'name', 'template_type', 'template_type_display', 
            'subject', 'html_content', 'plain_text_content', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class NewsletterCampaignSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    is_sent = serializers.BooleanField(read_only=True)
    subscriber_count = serializers.SerializerMethodField()
    
    class Meta:
        model = NewsletterCampaign
        fields = [
            'id', 'title', 'subject', 'content', 'template', 'template_name',
            'sent_at', 'created_at', 'scheduled_for', 'is_sent', 'subscriber_count'
        ]
        read_only_fields = ['sent_at', 'created_at']
    
    def get_subscriber_count(self, obj):
        """Get count of active subscribers for this campaign"""
        return NewsletterSubscriber.objects.filter(is_active=True).count()


class EmailLogSerializer(serializers.ModelSerializer):
    subscriber_email = serializers.CharField(source='subscriber.email', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    
    class Meta:
        model = EmailLog
        fields = [
            'id', 'subscriber', 'subscriber_email', 'template', 'template_name',
            'campaign', 'campaign_title', 'subject', 'sent_at', 'message_id', 'status'
        ]
        read_only_fields = ['sent_at']


class SendTestEmailSerializer(serializers.Serializer):
    """Serializer for sending test emails"""
    template_type = serializers.ChoiceField(choices=EmailTemplate.TEMPLATE_TYPES)
    test_email = serializers.EmailField()
    
    def validate_template_type(self, value):
        """Validate that template exists and is active"""
        try:
            template = EmailTemplate.objects.get(template_type=value, is_active=True)
            return value
        except EmailTemplate.DoesNotExist:
            raise serializers.ValidationError(f"No active template found for type: {value}")