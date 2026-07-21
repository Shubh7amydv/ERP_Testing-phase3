from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0019_rename_fees_to_otherfees'),
    ]

    operations = [
        migrations.CreateModel(
            name='Fees',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fees', models.DecimalField(decimal_places=2, max_digits=10)),
                ('installments', models.PositiveIntegerField()),
            ],
            options={
                'verbose_name': 'Fee',
                'verbose_name_plural': 'Fees',
            },
        ),
        migrations.AddField(
            model_name='academicclass',
            name='fee_structure',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='classes',
                to='students.fees',
            ),
        ),
    ]
