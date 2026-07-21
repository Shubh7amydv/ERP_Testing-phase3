from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Creates a superuser automatically if none exists (for deployment)'

    def handle(self, *args, **options):
        User = get_user_model()
        email = 'admin@example.com'
        password = 'Admin@1234'

        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                password=password,
            )
            self.stdout.write(self.style.SUCCESS(
                f'✅ Superuser created: {email} / {password}'
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f'ℹ️ Superuser already exists: {email}'
            ))
