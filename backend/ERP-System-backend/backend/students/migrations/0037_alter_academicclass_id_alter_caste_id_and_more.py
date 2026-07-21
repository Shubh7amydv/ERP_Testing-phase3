# No-op: IDs remain as BigAutoField to match existing database
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0036_replace_year_with_academicyear'),
    ]

    operations = []
