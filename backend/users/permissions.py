from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """Allows access only to users with the ADMIN role or superusers."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser or request.user.is_staff)
        )


class IsStudentRole(permissions.BasePermission):
    """Allows access only to users with the STUDENT role."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )


class IsStaffRole(permissions.BasePermission):
    """Allows access only to users with the STAFF role."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STAFF'
        )


class IsComplaintOwnerOrAdmin(permissions.BasePermission):
    """Allows complaint owner (student) or admins to view/modify."""
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True
        # Student owner
        return obj.student == request.user
