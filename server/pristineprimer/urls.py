from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def favicon(request):
    return HttpResponse(status=204)

urlpatterns = [
    # Critical: favicon first to avoid conflicts
    path('favicon.ico', favicon),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/auth/', include('users.urls')),
    path('api/', include('properties.urls')),
    path('api/newsletter/', include('newsletter.urls')),
    
    # Health checks
    path('health/', include('health_check.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# React app catch-all - must be LAST
urlpatterns += [
    re_path(r'^(?!admin|api|media|health|favicon\.ico).*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
]