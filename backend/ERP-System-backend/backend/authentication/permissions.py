from rest_framework.permissions import BasePermission
from common.permissions import IsSuperAdmin, IsSchoolAdmin  # noqa: F401


class HasPermission(BasePermission):
    """
    Fine-grained codename-based permission check.
    Usage: permission_classes = [HasPermission("fees.view")]
    Super Admin always bypasses this check.
    """

    def __init__(self, permission_codename):
        self.permission_codename = permission_codename
        super().__init__()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if request.user.role and request.user.role.name == 'Super Admin':
            return True
        if not request.user.role:
            return False
        from .models import RolePermission
        return RolePermission.objects.filter(
            role=request.user.role,
            permission__codename=self.permission_codename,
        ).exists()
