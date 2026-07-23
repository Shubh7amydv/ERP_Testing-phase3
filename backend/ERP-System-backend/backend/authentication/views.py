import uuid
from datetime import timedelta

from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Role, Permission, RolePermission, UserSession, PasswordResetToken
from .permissions import IsSuperAdmin, IsSchoolAdmin
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    RoleSerializer,
    PermissionSerializer,
    RolePermissionSerializer,
    UserSessionSerializer,
)

User = get_user_model()


# ==================== AUTH VIEWS ====================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'Account is disabled'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

        UserSession.objects.create(
            user=user,
            token=str(refresh),
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            expires_at=timezone.now() + timedelta(days=7),
        )

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_200_OK)

    def _get_client_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded.split(',')[0] if x_forwarded else request.META.get('REMOTE_ADDR')


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                session = UserSession.objects.get(user=request.user, token=refresh_token, is_active=True)
                session.is_active = False
                session.save()
            except UserSession.DoesNotExist:
                pass

        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_superuser and request.user.school is None:
            try:
                from schools.models import School
                school = School.objects.first()
                if school:
                    request.user.school = school
                    request.user.save(update_fields=['school'])
            except Exception:
                pass
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully'})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            token = str(uuid.uuid4())
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=1),
            )
            # TODO: Send email with token
        except User.DoesNotExist:
            pass

        return Response({'message': 'If the email exists, a reset link has been sent'})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        try:
            reset_token = PasswordResetToken.objects.get(
                token=token, is_used=False, expires_at__gt=timezone.now()
            )
            reset_token.user.set_password(serializer.validated_data['new_password'])
            reset_token.user.save()
            reset_token.is_used = True
            reset_token.save()
            return Response({'message': 'Password reset successful'})
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)


class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = UserSession.objects.filter(user=request.user, is_active=True)
        return Response(UserSessionSerializer(sessions, many=True).data)


class SessionDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            session = UserSession.objects.get(pk=pk, user=request.user)
            session.is_active = False
            session.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


# ==================== ROLE & PERMISSION VIEWS ====================

class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class RoleCreateView(generics.CreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class RoleDetailView(generics.RetrieveAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class RoleUpdateView(generics.UpdateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class RoleDeleteView(generics.DestroyAPIView):
    queryset = Role.objects.all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class AssignPermissionsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, pk):
        try:
            role = Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = RolePermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        permission_ids = serializer.validated_data['permission_ids']
        permissions = Permission.objects.filter(id__in=permission_ids)

        existing_ids = set(
            RolePermission.objects.filter(role=role, permission__in=permissions)
            .values_list('permission_id', flat=True)
        )

        new_permissions = [p for p in permissions if p.id not in existing_ids]
        already_existed = [p for p in permissions if p.id in existing_ids]

        for permission in new_permissions:
            RolePermission.objects.create(role=role, permission=permission)

        return Response({
            'message': f'{len(new_permissions)} permissions assigned to {role.name}',
            'assigned': [p.codename for p in new_permissions],
            'already_existed': [p.codename for p in already_existed],
        })


class RemovePermissionsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, pk):
        try:
            role = Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = RolePermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        permission_ids = serializer.validated_data['permission_ids']
        deleted_count = RolePermission.objects.filter(role=role, permission_id__in=permission_ids).delete()[0]

        return Response({'message': f'{deleted_count} permissions removed from {role.name}'})
