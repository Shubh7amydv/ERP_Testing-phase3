from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0034_create_hostel_other_fees'),
        ('fees', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='academicclass',
            name='fee_structure',
        ),
        migrations.DeleteModel(
            name='OtherFees',
        ),
        migrations.DeleteModel(
            name='HostelOtherFees',
        ),
        migrations.DeleteModel(
            name='StudentFeeInstallmentPaid',
        ),
        migrations.DeleteModel(
            name='StudentBackDues',
        ),
        migrations.DeleteModel(
            name='Fees',
        ),
        migrations.DeleteModel(
            name='Teacher',
        ),
    ]
