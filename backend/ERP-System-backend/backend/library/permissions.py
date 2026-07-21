from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsLibrarian(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role and
                request.user.role.name in ['School Admin', 'Librarian', 'Vice Principal', 'Principal'])


class IsSchoolMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.school is not None
