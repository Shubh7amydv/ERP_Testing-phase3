import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0038_fix_ids'),
    ]

    operations = [
        migrations.AlterField(
            model_name='admission',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]
