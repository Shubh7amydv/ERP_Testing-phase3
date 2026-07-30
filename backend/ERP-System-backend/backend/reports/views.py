import datetime

from django.db.models import Count, Q, Sum, Avg, F
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SavedReport, ReportSchedule
from .serializers import SavedReportSerializer, ReportScheduleSerializer


# ─── Saved Reports ───────────────────────────────────────────────

class SavedReportViewSet(viewsets.ModelViewSet):
    serializer_class = SavedReportSerializer
    filterset_fields = ("school", "report_type", "is_public")
    search_fields = ("name",)

    def get_queryset(self):
        return SavedReport.objects.filter(
            school=self.request.user.school
        ).select_related("created_by")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(
                {"message": "Report saved successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Report updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Report deleted."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def generate(self, request, pk=None):
        report = self.get_object()
        return Response({
            "message": f"Report '{report.name}' generated.",
            "report_type": report.report_type,
            "parameters": report.parameters,
        })


# ─── Report Schedules ────────────────────────────────────────────

class ReportScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ReportScheduleSerializer
    filterset_fields = ("school", "frequency", "is_active")

    def get_queryset(self):
        return ReportSchedule.objects.filter(
            school=self.request.user.school
        ).select_related("saved_report")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Schedule created.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Schedule updated.", "data": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Schedule deleted."}, status=status.HTTP_204_NO_CONTENT)


# ─── Helper ──────────────────────────────────────────────────────

def _school(request):
    return request.user.school


# ─── Student Reports ─────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_list_report(request):
    from students.models import Admission
    students = Admission.objects.filter(school=_school(request), is_active=True)
    return Response({
        "total": students.count(),
        "data": list(students.values("id", "first_name", "last_name", "admission_no", "academic_class__name")),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_class_wise_report(request):
    from students.models import Admission
    data = (
        Admission.objects.filter(school=_school(request), is_active=True)
        .values("academic_class__name")
        .annotate(count=Count("id"))
        .order_by("academic_class__name")
    )
    return Response(list(data))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_gender_wise_report(request):
    from students.models import Admission
    data = (
        Admission.objects.filter(school=_school(request), is_active=True)
        .values("gender")
        .annotate(count=Count("id"))
        .order_by("gender")
    )
    return Response(list(data))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_admission_trend_report(request):
    from students.models import Admission
    data = (
        Admission.objects.filter(school=_school(request), is_active=True)
        .values("admission_date__year")
        .annotate(count=Count("id"))
        .order_by("admission_date__year")
    )
    return Response(list(data))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_category_wise_report(request):
    from students.models import Admission
    data = (
        Admission.objects.filter(school=_school(request), is_active=True)
        .values("category__name")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    return Response(list(data))


# ─── Fee Reports ─────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fee_collection_summary(request):
    from fees.models import FeePayment
    payments = FeePayment.objects.filter(school=_school(request))
    total = payments.aggregate(total=Sum("amount"))["total"] or 0
    count = payments.count()
    return Response({"total_collected": total, "total_payments": count})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fee_pending_dues_report(request):
    from fees.models import FeePayment
    from students.models import Admission
    students = Admission.objects.filter(school=_school(request), is_active=True)
    data = []
    for s in students:
        paid = FeePayment.objects.filter(student=s, school=_school(request)).aggregate(total=Sum("amount"))["total"] or 0
        if paid == 0:
            data.append({"student": f"{s.first_name} {s.last_name}", "admission_no": s.admission_no, "paid": paid})
    return Response({"count": len(data), "data": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fee_class_wise_report(request):
    from fees.models import FeePayment
    data = (
        FeePayment.objects.filter(school=_school(request))
        .values("student__academic_class__name")
        .annotate(total=Sum("amount"), count=Count("id"))
        .order_by("student__academic_class__name")
    )
    return Response(list(data))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fee_monthly_trend_report(request):
    from fees.models import FeePayment
    data = (
        FeePayment.objects.filter(school=_school(request))
        .values("payment_date__year", "payment_date__month")
        .annotate(total=Sum("amount"), count=Count("id"))
        .order_by("payment_date__year", "payment_date__month")
    )
    return Response(list(data))


# ─── Attendance Reports ──────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_daily_report(request):
    from attendance.models import AttendanceRecord
    date_str = request.query_params.get("date")
    if date_str:
        target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    else:
        target_date = timezone.now().date()

    records = AttendanceRecord.objects.filter(school=_school(request), date=target_date)
    total = records.count()
    present = records.filter(status="present").count()
    absent = records.filter(status="absent").count()
    late = records.filter(status="late").count()

    return Response({
        "date": str(target_date),
        "total": total,
        "present": present,
        "absent": absent,
        "late": late,
        "percentage": round((present / total * 100), 2) if total > 0 else 0,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_monthly_report(request):
    from attendance.models import AttendanceRecord
    today = timezone.now().date()
    records = AttendanceRecord.objects.filter(
        school=_school(request),
        date__year=today.year,
        date__month=today.month,
    )
    total = records.count()
    present = records.filter(status="present").count()
    return Response({
        "month": today.strftime("%B %Y"),
        "total": total,
        "present": present,
        "absent": total - present,
        "percentage": round((present / total * 100), 2) if total > 0 else 0,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_class_wise_report(request):
    from attendance.models import AttendanceRecord
    data = (
        AttendanceRecord.objects.filter(school=_school(request))
        .values("student__academic_class__name")
        .annotate(
            total=Count("id"),
            present=Count("id", filter=Q(status="present")),
        )
        .order_by("student__academic_class__name")
    )
    result = []
    for row in data:
        pct = round((row["present"] / row["total"] * 100), 2) if row["total"] > 0 else 0
        result.append({**row, "percentage": pct})
    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_low_report(request):
    from attendance.models import AttendanceRecord
    from students.models import Admission
    threshold = int(request.query_params.get("threshold", 75))
    students = Admission.objects.filter(school=_school(request), is_active=True)
    low = []
    for s in students:
        total = AttendanceRecord.objects.filter(student=s, school=_school(request)).count()
        if total == 0:
            continue
        present = AttendanceRecord.objects.filter(student=s, school=_school(request), status="present").count()
        pct = round((present / total * 100), 2)
        if pct < threshold:
            low.append({
                "student": f"{s.first_name} {s.last_name}",
                "admission_no": s.admission_no,
                "total": total,
                "present": present,
                "percentage": pct,
            })
    return Response({"threshold": threshold, "count": len(low), "data": low})


# ─── Exam Reports ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def exam_class_performance_report(request):
    from examinations.models import ExamResult
    data = (
        ExamResult.objects.filter(exam__school=_school(request))
        .values("exam__exam_type__name", "student__academic_class__name")
        .annotate(avg_marks=Avg("marks_obtained"), count=Count("id"))
        .order_by("student__academic_class__name")
    )
    return Response(list(data))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def exam_subject_analysis_report(request):
    from examinations.models import ExamResult
    data = (
        ExamResult.objects.filter(exam__school=_school(request))
        .values("subject__name")
        .annotate(avg_marks=Avg("marks_obtained"), count=Count("id"))
        .order_by("subject__name")
    )
    return Response(list(data))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def exam_toppers_report(request):
    from examinations.models import ExamResult
    limit = int(request.query_params.get("limit", 10))
    toppers = (
        ExamResult.objects.filter(exam__school=_school(request))
        .select_related("student", "exam", "subject")
        .order_by("-marks_obtained")[:limit]
    )
    data = [
        {
            "student": f"{r.student.first_name} {r.student.last_name}",
            "exam": r.exam.name,
            "subject": r.subject.name,
            "marks": r.marks_obtained,
        }
        for r in toppers
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def exam_pass_fail_report(request):
    from examinations.models import ExamResult
    total = ExamResult.objects.filter(exam__school=_school(request)).count()
    passed = ExamResult.objects.filter(exam__school=_school(request), is_pass=True).count()
    failed = total - passed
    return Response({
        "total": total,
        "passed": passed,
        "failed": failed,
        "pass_percentage": round((passed / total * 100), 2) if total > 0 else 0,
    })


# ─── HR Reports ──────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hr_staff_list_report(request):
    from hr.models import Staff
    staff = Staff.objects.filter(school=_school(request)).select_related("department", "designation")
    data = [
        {
            "id": s.id,
            "name": f"{s.first_name} {s.last_name}",
            "department": s.department.name if s.department else None,
            "designation": s.designation.name if s.designation else None,
        }
        for s in staff
    ]
    return Response({"total": len(data), "data": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hr_department_wise_report(request):
    from hr.models import Staff
    data = (
        Staff.objects.filter(school=_school(request))
        .values("department__name")
        .annotate(count=Count("id"))
        .order_by("department__name")
    )
    return Response(list(data))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hr_payroll_summary_report(request):
    from hr.models import SalarySlip
    data = (
        SalarySlip.objects.filter(school=_school(request))
        .values("month__name", "year")
        .annotate(total=Sum("net_salary"), count=Count("id"))
        .order_by("-year", "-month__name")
    )
    return Response(list(data))


# ─── Dashboard ───────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_overview(request):
    from students.models import Admission
    from fees.models import FeePayment
    from attendance.models import AttendanceRecord
    from hr.models import Staff

    school = _school(request)
    today = timezone.now().date()

    total_students = Admission.objects.filter(school=school, is_active=True).count()
    total_staff = Staff.objects.filter(school=school).count()

    total_fees = FeePayment.objects.filter(school=school).aggregate(total=Sum("amount"))["total"] or 0
    month_fees = FeePayment.objects.filter(school=school, payment_date__year=today.year, payment_date__month=today.month).aggregate(total=Sum("amount"))["total"] or 0

    today_attendance = AttendanceRecord.objects.filter(school=school, date=today)
    present_today = today_attendance.filter(status="present").count()
    total_today = today_attendance.count()

    return Response({
        "total_students": total_students,
        "total_staff": total_staff,
        "total_fee_collected": total_fees,
        "monthly_fee_collected": month_fees,
        "attendance_today": {
            "present": present_today,
            "total": total_today,
            "percentage": round((present_today / total_today * 100), 2) if total_today > 0 else 0,
        },
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_recent_activity(request):
    from communication.models import Notification
    from events.models import Event

    school = _school(request)
    notifications = Notification.objects.filter(school=school).order_by("-created_at")[:5]
    events = Event.objects.filter(school=school, is_active=True, start_date__gte=timezone.now()).order_by("start_date")[:5]

    return Response({
        "notifications": [
            {"id": n.id, "title": n.title, "type": n.notification_type, "created_at": n.created_at}
            for n in notifications
        ],
        "upcoming_events": [
            {"id": e.id, "title": e.title, "start_date": e.start_date, "type": e.event_type.name}
            for e in events
        ],
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_announcements(request):
    from communication.models import Circular
    school = _school(request)
    circulars = Circular.objects.filter(school=school, published=True).order_by("-published_at")[:5]
    return Response([
        {"id": c.id, "title": c.title, "published_at": c.published_at}
        for c in circulars
    ])
