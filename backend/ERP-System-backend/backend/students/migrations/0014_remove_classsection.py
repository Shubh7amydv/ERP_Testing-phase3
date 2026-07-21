from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0013_add_fields_and_refactor_class_section'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='admission',
            name='class_section',
        ),
        migrations.RemoveField(
            model_name='teacher',
            name='class_section',
        ),
        migrations.DeleteModel(
            name='ClassSection',
        ),
    ]
