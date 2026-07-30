from django.contrib import admin
from .models import Role, Permission, RolePermission, UserSession, PasswordResetToken

admin.site.register(Role)
admin.site.register(Permission)
admin.site.register(RolePermission)
admin.site.register(UserSession)
admin.site.register(PasswordResetToken)