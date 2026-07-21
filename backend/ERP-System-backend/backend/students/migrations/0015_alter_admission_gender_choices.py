from django.db import migrations, models
import uuid


def clean_gender(apps, schema_editor):
    Admission = apps.get_model('students', 'Admission')
    for admission in Admission.objects.all():
        if admission.gender not in ('Male', 'Female'):
            admission.gender = None
            admission.save(update_fields=['gender'])


def set_gender_choices(apps, schema_editor):
    # This function is not needed; choices are set in model field definition.
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('students', '0014_remove_classsection'),
    ]

    operations = [
        migrations.AlterField(
            model_name='admission',
            name='gender',
            field=models.CharField(blank=True, choices=[('Male', 'Male'), ('Female', 'Female')], max_length=6, null=True),
        ),
        migrations.RunPython(clean_gender, migrations.RunPython.noop),
    ]
