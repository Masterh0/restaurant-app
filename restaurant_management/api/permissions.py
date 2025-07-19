# api/permissions.py

from rest_framework.permissions import BasePermission

class IsManager(BasePermission):
    """
    Custom permission to grant access only to users with 'manager' role.
    """

    class IsManager(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            if user.is_authenticated and user.role == 'manager':
                print(f"Manager user: {user.username} is authenticated.")
                return True
            return False
        
class IsEmployee(BasePermission):
    """
    Custom permission to grant access only to users with 'manager' role.
    """

    class IsEmployee(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            if user.is_authenticated and user.role == 'employee':
                print(f"employee user: {user.username} is authenticated.")
                return True
            return False
