from django.db import migrations


def populate_category_fk(apps, schema_editor):
    Admission = apps.get_model('students', 'Admission')
    Category = apps.get_model('students', 'Category')
    for admission in Admission.objects.exclude(category_legacy__isnull=True).exclude(category_legacy=''):
        name = admission.category_legacy.strip()
        if name:
            category_obj, _ = Category.objects.get_or_create(name=name)
            admission.category = category_obj
            admission.save(update_fields=['category'])


class Migration(migrations.Migration):
    """
    Step 2: Populate the new category FK from the legacy CharField values,
    then drop the legacy column.
    """

    dependencies = [
        ('students', '0022_category_admission_category_fk'),
    ]

    operations = [
        migrations.RunPython(populate_category_fk, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='admission',
            name='category_legacy',
        ),
    ]
