from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('properties.urls')),
    path('api/newsletter/', include('newsletter.urls')),
    path('health/', include('health_check.urls')),
]

# Media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# React app routes - exclude admin, api, and media paths
urlpatterns += [
    re_path(r'^(?!admin|api|media).*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
]