from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """
    Step 1: Create Category model, rename the old category CharField to
    category_legacy so we can preserve existing values for the data migration,
    and add the new category FK (nullable).
    """

    dependencies = [
        ('students', '0021_year_detail'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.RenameField(
            model_name='admission',
            old_name='category',
            new_name='category_legacy',
        ),
        migrations.AddField(
            model_name='admission',
            name='category',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='admissions',
                to='students.category',
            ),
        ),
    ]
