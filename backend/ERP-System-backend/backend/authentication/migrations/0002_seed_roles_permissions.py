from django.db import migrations


PREDEFINED_PERMISSIONS = [
    ("admissions.view", "admissions", "view", "View Admissions"),
    ("admissions.add", "admissions", "add", "Add Admission"),
    ("admissions.change", "admissions", "change", "Change Admission"),
    ("admissions.delete", "admissions", "delete", "Delete Admission"),

    ("fees.view", "fees", "view", "View Fees"),
    ("fees.add", "fees", "add", "Add Fee"),
    ("fees.change", "fees", "change", "Change Fee"),
    ("fees.delete", "fees", "delete", "Delete Fee"),
    ("fees.collect", "fees", "add", "Collect Fee Payment"),

    ("attendance.view", "attendance", "view", "View Attendance"),
    ("attendance.mark", "attendance", "add", "Mark Attendance"),
    ("attendance.change", "attendance", "change", "Change Attendance"),

    ("exams.view", "exams", "view", "View Exams"),
    ("exams.add", "exams", "add", "Add Exam"),
    ("exams.change", "exams", "change", "Change Exam"),
    ("exams.delete", "exams", "delete", "Delete Exam"),

    ("library.view", "library", "view", "View Library"),
    ("library.add", "library", "add", "Add Book"),
    ("library.issue", "library", "add", "Issue Book"),
    ("library.return", "library", "change", "Return Book"),

    ("hr.view", "hr", "view", "View HR"),
    ("hr.add", "hr", "add", "Add Employee"),
    ("hr.change", "hr", "change", "Change Employee"),
    ("hr.delete", "hr", "delete", "Delete Employee"),
    ("hr.payroll", "hr", "change", "Manage Payroll"),

    ("transport.view", "transport", "view", "View Transport"),
    ("transport.add", "transport", "add", "Add Route"),
    ("transport.change", "transport", "change", "Change Route"),
    ("transport.delete", "transport", "delete", "Delete Route"),

    ("reports.view", "reports", "view", "View Reports"),
    ("reports.export", "reports", "add", "Export Reports"),

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


def seed_roles_permissions(apps, schema_editor):
    Role = apps.get_model("authentication", "Role")
    Permission = apps.get_model("authentication", "Permission")

    for codename, module, action, description in PREDEFINED_PERMISSIONS:
        Permission.objects.get_or_create(
            codename=codename,
            defaults={
                "module": module,
                "action": action,
                "description": description,
            },
        )

    for role_name in PREDEFINED_ROLES:
        Role.objects.get_or_create(
            name=role_name,
            defaults={
                "description": f"{role_name} role",
                "permissions": {},
                "is_active": True,
            },
        )


def remove_roles_permissions(apps, schema_editor):
    Role = apps.get_model("authentication", "Role")
    Permission = apps.get_model("authentication", "Permission")

    Role.objects.filter(name__in=PREDEFINED_ROLES).delete()

    permission_codenames = [item[0] for item in PREDEFINED_PERMISSIONS]
    Permission.objects.filter(codename__in=permission_codenames).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_roles_permissions, remove_roles_permissions),
    ]