from django.db import migrations

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


def seed_roles(apps, schema_editor):
    Role = apps.get_model("authentication", "Role")
    for role_name in PREDEFINED_ROLES:
        Role.objects.get_or_create(
            name=role_name,
            defaults={"description": f"{role_name} role", "is_active": True},
        )


def reverse_seed_roles(apps, schema_editor):
    Role = apps.get_model("authentication", "Role")
    Role.objects.filter(name__in=PREDEFINED_ROLES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0001_initial"),
        ("schools", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_roles, reverse_seed_roles),
    ]
