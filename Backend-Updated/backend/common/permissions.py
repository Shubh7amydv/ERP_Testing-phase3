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


class IsAccountant(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role
            and request.user.role.name in ['School Admin', 'Accountant']
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
        from authentication.models import RolePermission
        return RolePermission.objects.filter(
            role=request.user.role,
            permission__codename=self.permission_codename,
        ).exists()


def ModulePermission(module_name):
    """
    Factory that returns a permission class for the given module.
    Usage: permission_classes = [IsSchoolMember, ModulePermission("fees")]
    """

    class _ModulePermission(BasePermission):
        def has_permission(self, request, view):
            if not request.user or not request.user.is_authenticated:
                return False
            if request.user.is_superuser:
                return True
            if request.user.role and request.user.role.name == 'Super Admin':
                return True
            if not request.user.role:
                return False

            method = request.method
            if method in ('GET', 'HEAD', 'OPTIONS'):
                codename = f'{module_name}.view'
            elif method == 'POST':
                codename = f'{module_name}.add'
            elif method in ('PUT', 'PATCH'):
                codename = f'{module_name}.change'
            elif method == 'DELETE':
                codename = f'{module_name}.delete'
            else:
                return False

            from authentication.models import RolePermission
            return RolePermission.objects.filter(
                role=request.user.role,
                permission__codename=codename,
            ).exists()

    _ModulePermission.__name__ = f'ModulePermission_{module_name}'
    _ModulePermission.__qualname__ = f'ModulePermission_{module_name}'
    return _ModulePermission
