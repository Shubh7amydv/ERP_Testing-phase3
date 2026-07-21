# Task: Authentication & Authorization Module (Module 0)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 3
> **Tech Stack:** Django 6 + DRF + PostgreSQL + SimpleJWT

---

## Current State

- `accounts.User` model exists but is basic (only email, is_active, is_staff, school_id)
- No auth endpoints, no login/logout, no JWT
- No Role/Permission models
- `simplejwt` not installed yet
- `REST_FRAMEWORK` settings have empty auth/permission classes
- No `authentication` app exists yet

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `authentication` Django App
- Run `python manage.py startapp authentication`
- Add `'authentication'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Modify `accounts.User` Model
Add these fields to `accounts/models.py` → `User` model:

```python
# Add these fields to User model
school = models.ForeignKey('schools.School', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
role = models.ForeignKey('authentication.Role', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
first_name = models.CharField(max_length=100, blank=True)
last_name = models.CharField(max_length=100, blank=True)
phone = models.CharField(max_length=15, blank=True)
avatar = models.ImageField(upload_to='avatars/', blank=True)
```

**Note:** `school` FK will be nullable initially since `School` model doesn't exist yet. Same for `role` FK - will resolve after Role model is created.

### Task V3: Create `Role` Model
File: `authentication/models.py`

```python
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
```

### Task V4: Create `Permission` Model
File: `authentication/models.py`

```python
class Permission(models.Model):
    ACTION_CHOICES = [
        ('view', 'View'),
        ('add', 'Add'),
        ('change', 'Change'),
        ('delete', 'Delete'),
    ]
    
    codename = models.CharField(max_length=100, unique=True)  # e.g. "admissions.view"
    module = models.CharField(max_length=50)  # e.g. "admissions"
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ('module', 'action')

    def __str__(self):
        return self.codename
```

### Task V5: Create `RolePermission` Model (M2M Through)
File: `authentication/models.py`

```python
class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='role_permissions')

    class Meta:
        unique_together = ('role', 'permission')

    def __str__(self):
        return f"{self.role.name} - {self.permission.codename}"
```

### Task V6: Create `UserSession` Model
File: `authentication/models.py`

```python
class UserSession(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='sessions')
    token = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.token[:20]}..."
```

### Task V7: Create `PasswordResetToken` Model
File: `authentication/models.py`

```python
class PasswordResetToken(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='password_resets')
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.token[:20]}..."
```

### Task V8: Create Permission Data Fixture / Migration
Create a data migration or fixture that inserts all predefined permissions:

```python
PREDEFINED_PERMISSIONS = [
    # Admissions
    ("admissions.view", "admissions", "view", "View Admissions"),
    ("admissions.add", "admissions", "add", "Add Admission"),
    ("admissions.change", "admissions", "change", "Change Admission"),
    ("admissions.delete", "admissions", "delete", "Delete Admission"),
    # Fees
    ("fees.view", "fees", "view", "View Fees"),
    ("fees.add", "fees", "add", "Add Fee"),
    ("fees.change", "fees", "change", "Change Fee"),
    ("fees.delete", "fees", "delete", "Delete Fee"),
    ("fees.collect", "fees", "add", "Collect Fee Payment"),
    # Attendance
    ("attendance.view", "attendance", "view", "View Attendance"),
    ("attendance.mark", "attendance", "add", "Mark Attendance"),
    ("attendance.change", "attendance", "change", "Change Attendance"),
    # Exams
    ("exams.view", "exams", "view", "View Exams"),
    ("exams.add", "exams", "add", "Add Exam"),
    ("exams.change", "exams", "change", "Change Exam"),
    ("exams.delete", "exams", "delete", "Delete Exam"),
    # Library
    ("library.view", "library", "view", "View Library"),
    ("library.add", "library", "add", "Add Book"),
    ("library.issue", "library", "add", "Issue Book"),
    ("library.return", "library", "change", "Return Book"),
    # HR
    ("hr.view", "hr", "view", "View HR"),
    ("hr.add", "hr", "add", "Add Employee"),
    ("hr.change", "hr", "change", "Change Employee"),
    ("hr.delete", "hr", "delete", "Delete Employee"),
    ("hr.payroll", "hr", "change", "Manage Payroll"),
    # Transport
    ("transport.view", "transport", "view", "View Transport"),
    ("transport.add", "transport", "add", "Add Route"),
    ("transport.change", "transport", "change", "Change Route"),
    ("transport.delete", "transport", "delete", "Delete Route"),
    # Reports
    ("reports.view", "reports", "view", "View Reports"),
    ("reports.export", "reports", "add", "Export Reports"),
    # Settings
    ("settings.view", "settings", "view", "View Settings"),
    ("settings.change", "settings", "change", "Change Settings"),
]

PREDEFINED_ROLES = [
    "Super Admin",
    "School Admin",
    "Principal",
    "Vice Principal",
    "Accountant",
    "Librarian",
    "Teacher",
    "Transport Manager",
    "Office Staff",
    "Parent",
]
```

### Task V9: Register Models in Admin
File: `authentication/admin.py` - Register Role, Permission, RolePermission, UserSession, PasswordResetToken

### Task V10: Run Migrations
- `python manage.py makemigrations authentication`
- `python manage.py makemigrations accounts` (for User model changes)
- `python manage.py migrate`
- Create superuser if not exists: `python manage.py createsuperuser`

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Install SimpleJWT Package
```bash
pip install djangorestframework-simplejwt==5.3.1
```
Add to `requirements.txt`

### Task S2: Configure JWT in `config/settings.py`
```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
```

### Task S3: Create Serializers
File: `authentication/serializers.py`

Create serializers for:
- `LoginSerializer` (email + password)
- `RegisterSerializer` (admin only user creation)
- `UserSerializer` (profile data)
- `ChangePasswordSerializer` (old_password + new_password)
- `PasswordResetRequestSerializer` (email)
- `PasswordResetConfirmSerializer` (token + new_password)
- `RoleSerializer`
- `PermissionSerializer`
- `RolePermissionSerializer` (assign/remove permissions)
- `UserSessionSerializer`

### Task S4: Create Custom Permissions
File: `authentication/permissions.py`

```python
from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser

class IsSchoolAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role and request.user.role.name == 'School Admin'

class HasPermission(BasePermission):
    def __init__(self, permission_codename):
        self.permission_codename = permission_codename
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.role and self.permission_codename in request.user.role.permissions
```

### Task S5: Create Auth Views
File: `authentication/views.py`

Implement these view functions/classes:

| Endpoint | View | Method | Description |
|----------|------|--------|-------------|
| `/auth/login/` | `LoginView` | POST | Email+password → JWT tokens |
| `/auth/logout/` | `LogoutView` | POST | Invalidate current session |
| `/auth/refresh/` | `TokenRefreshView` | POST | Refresh access token |
| `/auth/register/` | `RegisterView` | POST | Create user (admin only) |
| `/auth/password-reset/` | `PasswordResetRequestView` | POST | Send reset email |
| `/auth/password-reset/confirm/` | `PasswordResetConfirmView` | POST | Confirm with token |
| `/auth/me/` | `UserProfileView` | GET/PUT | Get/update profile |
| `/auth/change-password/` | `ChangePasswordView` | PUT | Change password |
| `/auth/sessions/` | `SessionListView` | GET | List active sessions |
| `/auth/sessions/{id}/` | `SessionDeleteView` | DELETE | Revoke session |

### Task S6: Create Role & Permission Views
File: `authentication/views.py`

| Endpoint | View | Method | Description |
|----------|------|--------|-------------|
| `/roles/` | `RoleListView` | GET | List all roles |
| `/roles/` | `RoleCreateView` | POST | Create role |
| `/roles/{id}/` | `RoleDetailView` | GET | Role detail + permissions |
| `/roles/{id}/` | `RoleUpdateView` | PUT | Update role |
| `/roles/{id}/` | `RoleDeleteView` | DELETE | Delete role |
| `/permissions/` | `PermissionListView` | GET | List all permissions |
| `/roles/{id}/assign-permissions/` | `AssignPermissionsView` | POST | Assign permissions to role |
| `/roles/{id}/remove-permissions/` | `RemovePermissionsView` | POST | Remove permissions from role |

### Task S7: Create URL Patterns
File: `authentication/urls.py`

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/register/', views.RegisterView.as_view(), name='auth-register'),
    path('auth/password-reset/', views.PasswordResetRequestView.as_view(), name='auth-password-reset'),
    path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('auth/me/', views.UserProfileView.as_view(), name='auth-me'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='auth-change-password'),
    path('auth/sessions/', views.SessionListView.as_view(), name='auth-sessions'),
    path('auth/sessions/<int:pk>/', views.SessionDeleteView.as_view(), name='auth-session-delete'),
    
    # Roles
    path('roles/', views.RoleListView.as_view(), name='role-list'),
    path('roles/<int:pk>/', views.RoleDetailView.as_view(), name='role-detail'),
    path('roles/<int:pk>/assign-permissions/', views.AssignPermissionsView.as_view(), name='role-assign-permissions'),
    path('roles/<int:pk>/remove-permissions/', views.RemovePermissionsView.as_view(), name='role-remove-permissions'),
    
    # Permissions
    path('permissions/', views.PermissionListView.as_view(), name='permission-list'),
]
```

### Task S8: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('authentication.urls')),
```

### Task S9: Create Login Logic
The login endpoint should:
1. Validate email + password
2. Check if user exists and is active
3. Generate JWT access + refresh tokens
4. Create a `UserSession` record with the refresh token
5. Return tokens + basic user info

### Task S10: Create Logout Logic
The logout endpoint should:
1. Get the current user's session (by refresh token or session ID)
2. Mark `is_active = False` on the session
3. Blacklist the refresh token if using blacklist app

### Task S11: Create Profile Endpoint
The `/auth/me/` endpoint should:
- GET: Return current user's profile (email, name, role, permissions, school)
- PUT: Update first_name, last_name, phone, avatar

### Task S12: Create Permission Check Decorator/Logic
For protecting endpoints, create a utility that checks if the current user's role has the required permission codename. This will be used by all other modules later.

---

## Implementation Order (Suggested)

1. **Varun first:** Create app + models + migrations + admin (V1-V10)
2. **Sudipto parallel:** Install simplejwt, create settings config, serializers, views (S1-S12)
3. **Both test together:** Run server, test login/logout/profile with curl or Postman

---

## API Request/Response Examples

### POST `/auth/login/`
```json
// Request
{
    "email": "admin@school.com",
    "password": "secret123"
}

// Response 200
{
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "uuid",
        "email": "admin@school.com",
        "first_name": "Admin",
        "last_name": "User",
        "role": "Super Admin",
        "permissions": ["admissions.view", "fees.view", ...]
    }
}
```

### POST `/auth/register/` (Admin Only)
```json
// Request
{
    "email": "teacher@school.com",
    "password": "secure123",
    "first_name": "Rahul",
    "last_name": "Sharma",
    "role_id": 7,
    "phone": "9876543210"
}

// Response 201
{
    "id": "uuid",
    "email": "teacher@school.com",
    "first_name": "Rahul",
    "last_name": "Sharma",
    "role": "Teacher"
}
```

### GET `/auth/me/`
```json
// Response 200
{
    "id": "uuid",
    "email": "admin@school.com",
    "first_name": "Admin",
    "last_name": "User",
    "phone": "9876543210",
    "role": {
        "id": 1,
        "name": "Super Admin",
        "permissions": ["admissions.view", "admissions.add", ...]
    },
    "school": null
}
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| djangorestframework-simplejwt | 5.3.1 | JWT token generation/validation |
| djangorestframework | 3.17.1 | Already installed |
| Django | 6.0.5 | Already installed |
| Pillow | >=10.0.0 | For avatar ImageField |

---

## Notes

- `school` FK on User is nullable for now - will be connected when School module (Module 1) is built
- Password hashing is handled by Django's `AbstractBaseUser` (PBKDF2 by default)
- The `Admission.password` plaintext issue (from Current State Analysis) is separate from this module - that model stores student admission passwords, not auth passwords
- Sessions will be tracked via `UserSession` model, not Django's built-in sessions
- All endpoints should be prefixed with `/api/` in the final URL config
