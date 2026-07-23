from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Creates or updates the superuser for deployment'

    def handle(self, *args, **options):
        User = get_user_model()
        email = 'admin@example.com'
        password = 'Admin@1234'

        user, created = User.objects.get_or_create(email=email)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.first_name = 'Admin'
        user.last_name = 'ERP'
        user.set_password(password)
        
        try:
            from schools.models import School
            school = School.objects.first()
            if school:
                user.school = school
        except Exception:
            pass

        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(
                f'✅ Superuser CREATED: {email} / {password}'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'✅ Superuser UPDATED (password reset): {email} / {password}'
            ))
