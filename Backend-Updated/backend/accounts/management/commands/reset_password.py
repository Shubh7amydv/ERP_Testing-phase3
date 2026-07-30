from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Reset super admin password'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Super admin email')
        parser.add_argument('new_password', type=str, help='New password')

    def handle(self, *args, **options):
        email = options['email']
        new_password = options['new_password']

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully reset password for {email}')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with email {email} does not exist')
            )
