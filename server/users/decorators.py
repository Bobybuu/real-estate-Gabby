# users/decorators.py
from django.http import JsonResponse
from functools import wraps

def role_required(allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({'error': 'Authentication required'}, status=401)
            
            if request.user.user_type not in allowed_roles:
                return JsonResponse({'error': 'Insufficient permissions'}, status=403)
                
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

# Specific role decorators
admin_required = role_required(['admin'])
seller_required = role_required(['seller', 'admin', 'agent'])
agent_required = role_required(['agent', 'admin'])