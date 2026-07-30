import django.db.models.deletion
from django.db import migrations, models


def populate_new_fks(apps, schema_editor):
    ClassSection = apps.get_model('students', 'ClassSection')
    Year = apps.get_model('students', 'Year')
    AcademicClass = apps.get_model('students', 'AcademicClass')
    Section = apps.get_model('students', 'Section')
    Admission = apps.get_model('students', 'Admission')
    Teacher = apps.get_model('students', 'Teacher')

    for cs in ClassSection.objects.all():
        year_str = cs.year or ''
        year_obj, _ = Year.objects.get_or_create(year=year_str)
        academic_class, _ = AcademicClass.objects.get_or_create(
            admission_class=cs.admission_class,
            year=year_obj,
        )
        section_obj, _ = Section.objects.get_or_create(
            section=cs.section,
            year=year_obj,
        )

    for admission in Admission.objects.select_related('class_section').iterator():
        cs = admission.class_section
        if cs is None:
            continue
        year_str = cs.year or ''
        year_obj, _ = Year.objects.get_or_create(year=year_str)
        academic_class, _ = AcademicClass.objects.get_or_create(
            admission_class=cs.admission_class,
            year=year_obj,
        )
        section_obj, _ = Section.objects.get_or_create(
            section=cs.section,
            year=year_obj,
        )
        Admission.objects.filter(pk=admission.pk).update(
            admission_class=academic_class,
            section=section_obj,
        )

    for teacher in Teacher.objects.select_related('class_section').iterator():
        cs = teacher.class_section
        if cs is None:
            continue
        year_str = cs.year or ''
        year_obj, _ = Year.objects.get_or_create(year=year_str)
        academic_class, _ = AcademicClass.objects.get_or_create(
            admission_class=cs.admission_class,
            year=year_obj,
        )
        section_obj, _ = Section.objects.get_or_create(
            section=cs.section,
            year=year_obj,
        )
        Teacher.objects.filter(pk=teacher.pk).update(
            admission_class=academic_class,
            section=section_obj,
        )


def reverse_populate(apps, schema_editor):
    Admission = apps.get_model('students', 'Admission')
    Teacher = apps.get_model('students', 'Teacher')
    Admission.objects.all().update(admission_class=None, section=None)
    Teacher.objects.all().update(admission_class=None, section=None)


class Migration(migrations.Migration):

    dependencies = [
        # Resolves the two existing leaf nodes from the main branch
        ('students', '0011_alter_classsection_id_alter_classsection_section_and_more'),
        ('students', '0012_alter_classsection_section'),
    ]

    operations = [
        # --- New Admission fields (tasks 2–4) ---
        migrations.AddField(
            model_name='admission',
            name='medium',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='admission',
            name='dropout',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='admission',
            name='tc',
            field=models.BooleanField(default=False),
        ),

        # --- New normalised models (task 5) ---
        migrations.CreateModel(
            name='Year',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.CharField(help_text='Academic year in format YYYY-YYYY', max_length=9, unique=True)),
            ],
            options={
                'verbose_name': 'Year',
                'verbose_name_plural': 'Years',
            },
        ),
        migrations.CreateModel(
            name='AcademicClass',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('admission_class', models.CharField(
                    choices=[
                        ('NUR', 'Nursery'), ('LKG', 'LKG'), ('UKG', 'UKG'), ('PLAY', 'Play Group'),
                        ('I', 'Class 1'), ('II', 'Class 2'), ('III', 'Class 3'), ('IV', 'Class 4'),
                        ('V', 'Class 5'), ('VI', 'Class 6'), ('VII', 'Class 7'), ('VIII', 'Class 8'),
                        ('IX', 'Class 9'), ('X', 'Class 10'), ('XI', 'Class 11'), ('XII', 'Class 12'),
                    ],
                    max_length=10,
                )),
                ('year', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='classes', to='students.year')),
            ],
            options={
                'verbose_name': 'Academic Class',
                'verbose_name_plural': 'Academic Classes',
                'unique_together': {('admission_class', 'year')},
            },
        ),
        migrations.CreateModel(
            name='Section',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('section', models.CharField(
                    choices=[(chr(c), f'Section {chr(c)}') for c in range(ord('A'), ord('Z') + 1)],
                    max_length=1,
                )),
                ('year', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='students.year')),
            ],
            options={
                'verbose_name': 'Section',
                'verbose_name_plural': 'Sections',
                'unique_together': {('section', 'year')},
            },
        ),

        # --- New FK fields on Admission and Teacher ---
        migrations.AddField(
            model_name='admission',
            name='admission_class',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='admissions', to='students.academicclass'),
        ),
        migrations.AddField(
            model_name='admission',
            name='section',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='admissions', to='students.section'),
        ),
        migrations.AddField(
            model_name='teacher',
            name='admission_class',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='teachers', to='students.academicclass'),
        ),
        migrations.AddField(
            model_name='teacher',
            name='section',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='teachers', to='students.section'),
        ),

        # --- Back-fill new FKs from existing ClassSection data ---
        migrations.RunPython(populate_new_fks, reverse_populate),
    ]
