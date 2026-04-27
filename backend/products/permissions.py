from rest_framework.permissions import BasePermission

class IsVendor(BasePermission):
    message = "Only Vendors are allowed"
    
    def has_permission(self, request, view):
        return( request.user and 
            request.user.is_authenticated and request.user.role == "VENDOR"
        )
        
