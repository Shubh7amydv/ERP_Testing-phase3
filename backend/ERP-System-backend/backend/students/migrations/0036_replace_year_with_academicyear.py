"""
Data migration to:
1. Replace `year` FK (-> Year) with `academic_year` FK (-> AcademicYear)
2. Replace `school_id` UUIDField with proper `school` FK to School
"""
from django.db import migrations, models
import django.db.models.deletion


def run_sql(sql, params=None):
    if connection.vendor == 'sqlite':
        sql_upper = sql.upper()
        if 'ALTER COLUMN' in sql_upper or 'ADD CONSTRAINT' in sql_upper or 'INFORMATION_SCHEMA' in sql_upper:
            return
    with connection.cursor() as cursor:
        try:
            cursor.execute(sql, params)
        except Exception as e:
            if connection.vendor == 'sqlite':
                pass
            else:
                raise


from django.db import connection


def migrate_year_to_academic_year(apps, schema_editor):
    from schools.models import School, AcademicYear
    from datetime import date

    Year = apps.get_model('students', 'Year')
    default_school = School.objects.first()
    if not default_school:
        default_school = School.objects.create(
            name='Default School', code='DEFAULT',
            address='Default Address', city='Default',
            state='Default', pincode='000000',
            phone='0000000000', email='admin@default.com',
        )

    year_map = {}
    for year in Year.objects.all():
        sy, ey = year.year.split('-')
        ay, _ = AcademicYear.objects.get_or_create(
            school=default_school, year=year.year,
            defaults={'start_date': date(int(sy), 4, 1), 'end_date': date(int(ey), 3, 31)},
        )
        year_map[year.id] = ay

    # AcademicClass: year_id -> academic_year_id
    run_sql('ALTER TABLE "students_academicclass" ADD COLUMN "academic_year_id" integer')
    for yid, ay in year_map.items():
        run_sql(
            'UPDATE "students_academicclass" SET "academic_year_id" = %s WHERE "year_id" = %s',
            [ay.id, yid]
        )
    run_sql('ALTER TABLE "students_academicclass" ALTER COLUMN "academic_year_id" SET NOT NULL')
    run_sql("""ALTER TABLE "students_academicclass"
        ADD CONSTRAINT "students_academicclass_ay_fk"
        FOREIGN KEY ("academic_year_id") REFERENCES "schools_academicyear"("id") ON DELETE CASCADE""")
    run_sql('ALTER TABLE "students_academicclass" DROP COLUMN "year_id"')

    # Section: year_id -> academic_year_id
    run_sql('ALTER TABLE "students_section" ADD COLUMN "academic_year_id" integer')
    for yid, ay in year_map.items():
        run_sql(
            'UPDATE "students_section" SET "academic_year_id" = %s WHERE "year_id" = %s',
            [ay.id, yid]
        )
    run_sql('ALTER TABLE "students_section" ALTER COLUMN "academic_year_id" SET NOT NULL')
    run_sql("""ALTER TABLE "students_section"
        ADD CONSTRAINT "students_section_ay_fk"
        FOREIGN KEY ("academic_year_id") REFERENCES "schools_academicyear"("id") ON DELETE CASCADE""")
    run_sql('ALTER TABLE "students_section" DROP COLUMN "year_id"')

    # Caste: year_id -> academic_year_id (nullable)
    run_sql('ALTER TABLE "students_caste" ADD COLUMN "academic_year_id" integer')
    for yid, ay in year_map.items():
        run_sql(
            'UPDATE "students_caste" SET "academic_year_id" = %s WHERE "year_id" = %s',
            [ay.id, yid]
        )
    run_sql("""ALTER TABLE "students_caste"
        ADD CONSTRAINT "students_caste_ay_fk"
        FOREIGN KEY ("academic_year_id") REFERENCES "schools_academicyear"("id") ON DELETE CASCADE""")
    run_sql('ALTER TABLE "students_caste" DROP COLUMN "year_id"')

    # Category: year_id -> academic_year_id (nullable)
    run_sql('ALTER TABLE "students_category" ADD COLUMN "academic_year_id" integer')
    for yid, ay in year_map.items():
        run_sql(
            'UPDATE "students_category" SET "academic_year_id" = %s WHERE "year_id" = %s',
            [ay.id, yid]
        )
    run_sql("""ALTER TABLE "students_category"
        ADD CONSTRAINT "students_category_ay_fk"
        FOREIGN KEY ("academic_year_id") REFERENCES "schools_academicyear"("id") ON DELETE CASCADE""")
    run_sql('ALTER TABLE "students_category" DROP COLUMN "year_id"')


def migrate_school_id_to_fk(apps, schema_editor):
    if connection.vendor == 'sqlite':
        return
    tables = [
        'students_academicclass', 'students_section', 'students_caste',
        'students_category', 'students_house', 'students_siblinggroup',
        'students_admission',
    ]
    for tbl in tables:
        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = '{tbl}' AND column_name = 'school_id'
            """)
            if not cursor.fetchone():
                continue
            # Django ForeignKey 'school' maps to DB column 'school_id' - same as old UUIDField
            # Just add FK constraint (column already has correct name)
            run_sql(f"""ALTER TABLE "{tbl}"
                ADD CONSTRAINT "{tbl}_school_fk"
                FOREIGN KEY ("school_id") REFERENCES "schools_school"("id") ON DELETE CASCADE""")


class Migration(migrations.Migration):

    dependencies = [
        ('schools', '0001_initial'),
        ('students', '0035_remove_redundant_models'),
    ]

    operations = [
        migrations.RunPython(migrate_year_to_academic_year, migrations.RunPython.noop),
        migrations.RunPython(migrate_school_id_to_fk, migrations.RunPython.noop),

        # State-only: update Django's view of the schema

        # AcademicClass
        migrations.RunSQL(
            sql=migrations.RunSQL.noop,
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.RemoveField(model_name='academicclass', name='school_id'),
                migrations.RemoveField(model_name='academicclass', name='year'),
                migrations.AddField(
                    model_name='academicclass', name='school',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='academic_classes', to='schools.school'),
                ),
                migrations.AddField(
                    model_name='academicclass', name='academic_year',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='academic_classes', to='schools.academicyear'),
                ),
                migrations.AlterUniqueTogether(name='academicclass', unique_together={('admission_class', 'academic_year')}),
            ],
        ),

        # Section
        migrations.RunSQL(
            sql=migrations.RunSQL.noop,
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.RemoveField(model_name='section', name='school_id'),
                migrations.RemoveField(model_name='section', name='year'),
                migrations.AddField(
                    model_name='section', name='school',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='schools.school'),
                ),
                migrations.AddField(
                    model_name='section', name='academic_year',
                    field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='schools.academicyear'),
                ),
                migrations.AlterUniqueTogether(name='section', unique_together={('section', 'academic_year')}),
            ],
        ),

        # Caste
        migrations.RunSQL(
            sql=migrations.RunSQL.noop,
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.RemoveField(model_name='caste', name='school_id'),
                migrations.RemoveField(model_name='caste', name='year'),
                migrations.AddField(
                    model_name='caste', name='school',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='castes', to='schools.school'),
                ),
                migrations.AddField(
                    model_name='caste', name='academic_year',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='castes', to='schools.academicyear'),
                ),
            ],
        ),

        # Category
        migrations.RunSQL(
            sql=migrations.RunSQL.noop,
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.RemoveField(model_name='category', name='school_id'),
                migrations.RemoveField(model_name='category', name='year'),
                migrations.AddField(
                    model_name='category', name='school',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='categories', to='schools.school'),
                ),
                migrations.AddField(
                    model_name='category', name='academic_year',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='categories', to='schools.academicyear'),
                ),
            ],
        ),

        # House
        migrations.RunSQL(
            sql=migrations.RunSQL.noop,
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.RemoveField(model_name='house', name='school_id'),
                migrations.AddField(
                    model_name='house', name='school',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='houses', to='schools.school'),
                ),
            ],
        ),

        # SiblingGroup
        migrations.RunSQL(
            sql=migrations.RunSQL.noop,
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.RemoveField(model_name='siblinggroup', name='school_id'),
                migrations.AddField(
                    model_name='siblinggroup', name='school',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sibling_groups', to='schools.school'),
                ),
            ],
        ),

        # Admission
        migrations.RunSQL(
            sql=migrations.RunSQL.noop,
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.RemoveField(model_name='admission', name='school_id'),
                migrations.AddField(
                    model_name='admission', name='school',
                    field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='admissions', to='schools.school'),
                ),
                migrations.AlterModelOptions(name='admission', options={'ordering': ['-created_at']}),
            ],
        ),

        # Delete Year model
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS "students_year"',
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.DeleteModel(name='Year'),
            ],
        ),
    ]
