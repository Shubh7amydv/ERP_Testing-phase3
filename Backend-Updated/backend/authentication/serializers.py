from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role, Permission, RolePermission, UserSession

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'first_name', 'last_name', 'phone', 'role_id']

    def validate_role_id(self, value):
        if value is not None:
            try:
                Role.objects.get(id=value)
            except Role.DoesNotExist:
                raise serializers.ValidationError("Role not found.")
        return value

    def create(self, validated_data):
        role_id = validated_data.pop('role_id', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        if role_id:
            user.role_id = role_id
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True, default=None)
    school_name = serializers.CharField(source='school.name', read_only=True, default=None)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'avatar', 'role', 'role_name', 'school', 'school_name', 'permissions']
        read_only_fields = ['id', 'email']

    def get_permissions(self, obj):
        if obj.role and obj.role.name == 'Super Admin':
            return ['*']
        if obj.role and hasattr(obj.role, 'role_permissions'):
            return list(obj.role.role_permissions.values_list('permission__codename', flat=True))
        return []


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)


class RoleSerializer(serializers.ModelSerializer):
    permissions_count = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'is_active', 'permissions_count', 'permissions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_permissions_count(self, obj):
        return obj.role_permissions.count()

    def get_permissions(self, obj):
        if obj.name == 'Super Admin':
            return ['*']
        return list(
            obj.role_permissions
            .select_related('permission')
            .values_list('permission__codename', flat=True)
        )


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'codename', 'module', 'action', 'description']
        read_only_fields = ['id']


class RolePermissionSerializer(serializers.Serializer):
    permission_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ['id', 'token', 'ip_address', 'user_agent', 'expires_at', 'is_active', 'created_at']
        read_only_fields = ['id', 'token', 'created_at']
