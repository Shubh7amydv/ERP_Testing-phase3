from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    # path('auth/register/', views.RegisterView.as_view(), name='auth-register'),  # Disabled - Use Django Admin
    path('auth/password-reset/', views.PasswordResetRequestView.as_view(), name='auth-password-reset'),
    path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('auth/me/', views.UserProfileView.as_view(), name='auth-me'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='auth-change-password'),
    path('auth/sessions/', views.SessionListView.as_view(), name='auth-sessions'),
    path('auth/sessions/<int:pk>/', views.SessionDeleteView.as_view(), name='auth-session-delete'),

    # Roles
    path('roles/', views.RoleListView.as_view(), name='role-list'),
    path('roles/create/', views.RoleCreateView.as_view(), name='role-create'),
    path('roles/<int:pk>/', views.RoleDetailView.as_view(), name='role-detail'),
    path('roles/<int:pk>/update/', views.RoleUpdateView.as_view(), name='role-update'),
    path('roles/<int:pk>/delete/', views.RoleDeleteView.as_view(), name='role-delete'),
    path('roles/<int:pk>/assign-permissions/', views.AssignPermissionsView.as_view(), name='role-assign-permissions'),
    path('roles/<int:pk>/remove-permissions/', views.RemovePermissionsView.as_view(), name='role-remove-permissions'),

    # Permissions
    path('permissions/', views.PermissionListView.as_view(), name='permission-list'),
]
