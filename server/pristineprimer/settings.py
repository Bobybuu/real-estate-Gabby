"""
Django settings for pristineprimer project.
"""

import os
from pathlib import Path

# ---------------------------
# BASE DIRECTORY
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------
# SECURITY SETTINGS
# ---------------------------
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')  # Use env var in production!
DEBUG = True  # Set to False in production

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "18.217.243.193",
    "pristineprimier.co.ke",
    "www.pristineprimier.com",
    'api.pristineprimier.com',
    "main.d35ciakzcz3l11.amplifyapp.com",
    "www.pristineprimier.co.ke",
    "pristineprimier.com",
]

# ---------------------------
# APPLICATIONS
# ---------------------------
INSTALLED_APPS = [
    # Django default apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'corsheaders',
    'rest_framework',
    'django_ses',  # AWS SES integration
    
    'health_check',
    'health_check.db',
    'health_check.cache',  # Cache health check
    'health_check.storage',  # Storage health check

    # Local apps
    'users',
    'properties',
    'newsletter',  # Newsletter app added
]

# ---------------------------
# MIDDLEWARE
# ---------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Should be before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # CSRF middleware
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ---------------------------
# URLS / WSGI
# ---------------------------
ROOT_URLCONF = 'pristineprimer.urls'
WSGI_APPLICATION = 'pristineprimer.wsgi.application'

# ---------------------------
# TEMPLATES
# ---------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ---------------------------
# DATABASE (PostgreSQL)
# ---------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pristineprimer',
        'USER': 'postgres',
        'PASSWORD': 'Chrispine9909',
        'HOST': 'pristineprimer.czq8ae44qs94.us-east-2.rds.amazonaws.com',
        'PORT': '5432',
    }
}



# ---------------------------
# PASSWORD VALIDATION
# ---------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------
# INTERNATIONALIZATION
# ---------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------------------------
# STATIC & MEDIA FILES
# ---------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# (Optional) Uncomment if you use a local static folder
# STATICFILES_DIRS = [BASE_DIR / 'static']

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ---------------------------
# DEFAULT PRIMARY KEY FIELD TYPE
# ---------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------
# CUSTOM USER MODEL
# ---------------------------
AUTH_USER_MODEL = 'users.User'

# ---------------------------
# DJANGO REST FRAMEWORK
# ---------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# ---------------------------
# CORS CONFIGURATION
# ---------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",  # Vite dev server
    "https://main.d35ciakzcz3l11.amplifyapp.com",
    "https://pristineprimier.co.ke",
    "https://www.pristineprimier.com",
    "https://api.pristineprimier.com",
    "https://pristineprimier.com",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "https://www.pristineprimier.com",
    "https://pristineprimier.com",
    "https://api.pristineprimier.com",
    "https://main.d35ciakzcz3l11.amplifyapp.com",
    "https://pristineprimier.co.ke",
    "https://www.pristineprimier.co.ke",
]

# ---------------------------
# SESSION & CSRF SETTINGS
# ---------------------------
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 1209600  # 2 weeks in seconds
SESSION_COOKIE_NAME = 'pristineprimier_session'

# Security settings for cookies
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_DOMAIN = '.pristineprimier.com'

# ---------------------------
# AWS SES CONFIGURATION
# ---------------------------
"""
# Option 1: Using django-ses (Recommended - better AWS integration)
EMAIL_BACKEND = 'django_ses.SESBackend'

# AWS SES Credentials
AWS_SES_ACCESS_KEY_ID = os.getenv('AWS_SES_ACCESS_KEY_ID', 'your-smtp-username-here')
AWS_SES_SECRET_ACCESS_KEY = os.getenv('AWS_SES_SECRET_ACCESS_KEY', 'your-smtp-password-here')
AWS_SES_REGION_NAME = 'us-east-1'  # Change to your SES region (us-east-1, eu-west-1, etc.)
AWS_SES_REGION_ENDPOINT = f'email.{AWS_SES_REGION_NAME}.amazonaws.com'

# Optional: Configuration set for tracking
AWS_SES_CONFIGURATION_SET = 'newsletter-tracking'

# Email addresses
DEFAULT_FROM_EMAIL = 'PristinePrimier Real Estate <newsletter@pristineprimier.com>'
SERVER_EMAIL = 'alerts@pristineprimier.com'
NEWSLETTER_FROM_EMAIL = 'newsletter@pristineprimier.com'

# Fallback: SMTP configuration (if you prefer SMTP instead of django-ses)
"""
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'email-smtp.us-east-2.amazonaws.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('AWS_SES_SMTP_USERNAME')
EMAIL_HOST_PASSWORD = os.getenv('AWS_SES_SMTP_PASSWORD')
DEFAULT_FROM_EMAIL = 'PristinePrimier Real Estate <newsletter@pristineprimier.com>'

# Development override
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    # OR for file-based email testing:
    # EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
    # EMAIL_FILE_PATH = BASE_DIR / 'sent_emails'

# ---------------------------
# NEWSLETTER SPECIFIC SETTINGS
# ---------------------------
NEWSLETTER_SETTINGS = {
    'POPUP_DISMISSAL_DAYS': 3,
    'WELCOME_EMAIL_SUBJECT': 'Welcome to PristinePrimier Real Estate Newsletter!',
    'FROM_EMAIL': 'PristinePrimier Real Estate <newsletter@pristineprimier.com>',
    'REPLY_TO_EMAIL': 'info@pristineprimier.com',
    'ADMIN_EMAIL': 'admin@pristineprimier.com',
    'CONFIRMATION_REQUIRED': False,
    'MAX_EMAILS_PER_HOUR': 100,  # SES limit awareness
    'TRACK_OPENS': True,
    'TRACK_CLICKS': True,
}

# ---------------------------
# SECURITY SETTINGS FOR PRODUCTION
# ---------------------------
if not DEBUG:
    # Security settings
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

    # Additional production settings
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True

    # Switch to actual SES in production
    EMAIL_BACKEND = 'django_ses.SESBackend'

# ---------------------------
# LOGGING CONFIGURATION
# ---------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
        },
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'newsletter': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django_ses': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# ---------------------------
# FILE UPLOAD SETTINGS
# ---------------------------
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# ---------------------------
# CACHE CONFIGURATION (Optional)
# ---------------------------
# For better performance, you can add Redis/Memcached later
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# ---------------------------
# ADMIN SITE CONFIGURATION
# ---------------------------
ADMIN_SITE_HEADER = "PristinePrimier Real Estate Administration"
ADMIN_SITE_TITLE = "PristinePrimier Admin Portal"
ADMIN_INDEX_TITLE = "Welcome to PristinePrimier Admin"