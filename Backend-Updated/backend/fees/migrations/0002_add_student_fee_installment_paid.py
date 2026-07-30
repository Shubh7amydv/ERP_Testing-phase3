import uuid
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('schools', '0002_seed_roles'),
        ('students', '0035_remove_redundant_models'),
        ('fees', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentFeeInstallmentPaid',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('installment_number', models.PositiveIntegerField()),
                ('amount_paid', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('s_code', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('school', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='student_fee_installments', to='schools.school')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fee_installments', to='students.admission')),
            ],
            options={
                'verbose_name': 'Student Fee Installment Payment',
                'verbose_name_plural': 'Student Fee Installment Payments',
                'ordering': ['student', 'installment_number'],
                'unique_together': {('student', 'installment_number')},
            },
        ),
    ]
