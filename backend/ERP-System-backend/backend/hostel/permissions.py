from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return (
            request.user.role is not None
            and request.user.role.name == 'Super Admin'
        )


class IsSchoolAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if request.user.role and request.user.role.name == 'Super Admin':
            return True
        return request.user.role and request.user.role.name == 'School Admin'


class IsWarden(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if request.user.role and request.user.role.name == 'Super Admin':
            return True
        return (
            request.user.role
            and request.user.role.name in ['School Admin', 'Principal', 'Warden']
        )


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if request.user.role and request.user.role.name == 'Super Admin':
            return True
        return request.user.school is not None

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if request.user.role and request.user.role.name == 'Super Admin':
            return True
        if hasattr(obj, 'school'):
            return request.user.school_id == obj.school_id
        return False
