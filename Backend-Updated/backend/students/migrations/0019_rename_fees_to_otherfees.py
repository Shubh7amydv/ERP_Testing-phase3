from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0018_fees_model'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Fees',
            new_name='OtherFees',
        ),
    ]
