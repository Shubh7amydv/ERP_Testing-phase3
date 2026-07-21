from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0020_fees_academicclass_fee_structure'),
    ]

    operations = [
        migrations.AddField(
            model_name='year',
            name='detail',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
