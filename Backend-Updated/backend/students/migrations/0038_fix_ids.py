# State-only: sync Django's migration state with models.py
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0037_alter_academicclass_id_alter_caste_id_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql=migrations.RunSQL.noop,
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.AlterField(model_name='academicclass', name='id', field=models.BigAutoField(primary_key=True, serialize=False)),
                migrations.AlterField(model_name='caste', name='id', field=models.BigAutoField(primary_key=True, serialize=False)),
                migrations.AlterField(model_name='category', name='id', field=models.BigAutoField(primary_key=True, serialize=False)),
                migrations.AlterField(model_name='house', name='id', field=models.BigAutoField(primary_key=True, serialize=False)),
                migrations.AlterField(model_name='section', name='id', field=models.BigAutoField(primary_key=True, serialize=False)),
                migrations.AlterField(model_name='siblinggroup', name='id', field=models.BigAutoField(primary_key=True, serialize=False)),
            ],
        ),
    ]
