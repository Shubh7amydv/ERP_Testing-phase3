from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import School, AcademicYear, SchoolSettings, SchoolHoliday, SchoolNotificationTemplate
from .serializers import (
    SchoolSerializer, SchoolListSerializer, AcademicYearSerializer,
    SchoolSettingsSerializer, SchoolHolidaySerializer, SchoolNotificationTemplateSerializer
)
from .permissions import IsSuperAdmin, IsSchoolAdmin, IsSchoolMember


class SchoolListView(generics.ListAPIView):
    queryset = School.objects.filter(is_active=True)
    serializer_class = SchoolListSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class SchoolCreateView(generics.CreateAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def perform_create(self, serializer):
        school = serializer.save()
        SchoolSettings.objects.create(school=school)


class SchoolDetailView(generics.RetrieveAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]


class SchoolUpdateView(generics.UpdateAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class SchoolDeleteView(generics.DestroyAPIView):
    queryset = School.objects.all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def delete(self, request, *args, **kwargs):
        school = self.get_object()
        school.is_active = False
        school.save()
        return Response({'message': 'School deactivated successfully'}, status=status.HTTP_200_OK)


class SchoolSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = SchoolSettingsSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_object(self):
        school_id = self.kwargs['school_id']
        settings, created = SchoolSettings.objects.get_or_create(school_id=school_id)
        return settings


class AcademicYearListView(generics.ListAPIView):
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return AcademicYear.objects.filter(school_id=school_id)


class AcademicYearCreateView(generics.CreateAPIView):
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def perform_create(self, serializer):
        serializer.save(school_id=self.kwargs['school_id'])


class AcademicYearDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return AcademicYear.objects.filter(school_id=school_id)


class SetCurrentYearView(APIView):
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def post(self, request, school_id, pk):
        try:
            academic_year = AcademicYear.objects.get(pk=pk, school_id=school_id)
        except AcademicYear.DoesNotExist:
            return Response({'error': 'Academic year not found'}, status=status.HTTP_404_NOT_FOUND)

        academic_year.is_current = True
        academic_year.save()

        return Response({'message': f'{academic_year.year} set as current academic year'})


class HolidayListView(generics.ListAPIView):
    serializer_class = SchoolHolidaySerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return SchoolHoliday.objects.filter(school_id=school_id)


class HolidayCreateView(generics.CreateAPIView):
    serializer_class = SchoolHolidaySerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def perform_create(self, serializer):
        serializer.save(school_id=self.kwargs['school_id'])


class HolidayDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SchoolHolidaySerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return SchoolHoliday.objects.filter(school_id=school_id)


class TemplateListView(generics.ListAPIView):
    serializer_class = SchoolNotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsSchoolMember]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return SchoolNotificationTemplate.objects.filter(school_id=school_id)


class TemplateCreateView(generics.CreateAPIView):
    serializer_class = SchoolNotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def perform_create(self, serializer):
        serializer.save(school_id=self.kwargs['school_id'])


class TemplateDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SchoolNotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get_queryset(self):
        school_id = self.kwargs['school_id']
        return SchoolNotificationTemplate.objects.filter(school_id=school_id)
