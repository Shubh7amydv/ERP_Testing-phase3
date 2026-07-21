from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.school is not None
