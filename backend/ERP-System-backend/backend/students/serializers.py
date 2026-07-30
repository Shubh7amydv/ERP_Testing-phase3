import re

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.timezone import now
from .models import Admission, AcademicClass, Section, Caste, House, Category, GENDER_CHOICES
from schools.models import AcademicYear

User = get_user_model()
YEAR_PATTERN = re.compile(r'^\d{4}-\d{4}$')


def resolve_academic_year(year_str, school=None):
    if year_str is None:
        current_year = now().year
        year_str = f"{current_year}-{current_year + 1}"

    if not isinstance(year_str, str):
        raise serializers.ValidationError('Year must be a string in YYYY-YYYY format.')

    year_value = year_str.strip()
    if not year_value:
        current_year = now().year
        year_value = f"{current_year}-{current_year + 1}"

    if not YEAR_PATTERN.fullmatch(year_value):
        raise serializers.ValidationError('Year must be in YYYY-YYYY format.')

    start_year, end_year = year_value.split('-')
    if int(end_year) != int(start_year) + 1:
        raise serializers.ValidationError('Year must be a consecutive academic year like 2026-2027.')

    if school:
        academic_year, _ = AcademicYear.objects.get_or_create(
            school=school,
            year=year_value,
            defaults={
                'start_date': f"{start_year}-04-01",
                'end_date': f"{end_year}-03-31",
            }
        )
    else:
        academic_year = AcademicYear.objects.filter(year=year_value).first()
        if not academic_year:
            raise serializers.ValidationError(
                f"AcademicYear '{year_value}' not found. Create it via the school's academic years endpoint first."
            )

    return academic_year


class CasteSerializer(serializers.ModelSerializer):
    caste_name = serializers.CharField(source='name')
    academic_year = serializers.PrimaryKeyRelatedField(
        queryset=AcademicYear.objects.all(),
        required=False,
        allow_null=True,
    )
    academic_year_display = serializers.SerializerMethodField()

    class Meta:
        model = Caste
        fields = ['id', 'caste_name', 'academic_year', 'academic_year_display', 'school']
        read_only_fields = ['id', 'academic_year_display']

    def get_academic_year_display(self, obj):
        return obj.academic_year.year if obj.academic_year else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['academic_year'] = str(instance.academic_year_id) if instance.academic_year_id else None
        data['academic_year_display'] = instance.academic_year.year if instance.academic_year else None
        return data


class HouseSerializer(serializers.ModelSerializer):
    house_name = serializers.CharField(source='name')

    class Meta:
        model = House
        fields = ['id', 'house_name', 'color_code', 'school']


class AcademicClassSerializer(serializers.ModelSerializer):
    admission_class_display = serializers.SerializerMethodField()
    academic_year_display = serializers.SerializerMethodField()
    academic_year = serializers.PrimaryKeyRelatedField(
        queryset=AcademicYear.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = AcademicClass
        fields = [
            'id', 'admission_class', 'academic_year',
            'admission_class_display', 'academic_year_display',
            'school',
        ]
        read_only_fields = ['id', 'admission_class_display', 'academic_year_display']

    def get_admission_class_display(self, obj):
        return obj.get_admission_class_display()

    def get_academic_year_display(self, obj):
        return obj.academic_year.year if obj.academic_year else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['academic_year'] = str(instance.academic_year_id) if instance.academic_year_id else None
        data['academic_year_display'] = instance.academic_year.year if instance.academic_year else None
        return data

    def validate(self, data):
        admission_class = data.get('admission_class')
        academic_year = data.get('academic_year')

        if not self.instance:
            if AcademicClass.objects.filter(admission_class=admission_class, academic_year=academic_year).exists():
                raise serializers.ValidationError(
                    f"AcademicClass '{admission_class}' for year '{academic_year.year}' already exists."
                )
        else:
            qs = AcademicClass.objects.filter(
                admission_class=admission_class, academic_year=academic_year
            ).exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    f"AcademicClass '{admission_class}' for year '{academic_year.year}' already exists."
                )

        return data


class SectionSerializer(serializers.ModelSerializer):
    section_display = serializers.SerializerMethodField()
    academic_year_display = serializers.SerializerMethodField()
    academic_year = serializers.PrimaryKeyRelatedField(
        queryset=AcademicYear.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Section
        fields = ['id', 'section', 'academic_year', 'section_display', 'academic_year_display', 'school']
        read_only_fields = ['id', 'section_display', 'academic_year_display']

    def get_section_display(self, obj):
        return obj.get_section_display()

    def get_academic_year_display(self, obj):
        return obj.academic_year.year if obj.academic_year else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['academic_year'] = str(instance.academic_year_id) if instance.academic_year_id else None
        data['academic_year_display'] = instance.academic_year.year if instance.academic_year else None
        return data

    def validate(self, data):
        section = data.get('section')
        academic_year = data.get('academic_year')

        if not self.instance:
            if Section.objects.filter(section=section, academic_year=academic_year).exists():
                raise serializers.ValidationError(
                    f"Section '{section}' for year '{academic_year.year}' already exists."
                )
        else:
            qs = Section.objects.filter(
                section=section, academic_year=academic_year
            ).exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    f"Section '{section}' for year '{academic_year.year}' already exists."
                )

        return data


class AdmissionSerializer(serializers.ModelSerializer):
    user_id = serializers.SerializerMethodField()
    sibling_group_id = serializers.SerializerMethodField()
    sibling_group_name = serializers.SerializerMethodField()

    def _normalize_value(self, value):
        if isinstance(value, (list, tuple)) and value:
            return value[0]
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith('[') and stripped.endswith(']'):
                try:
                    import ast
                    parsed = ast.literal_eval(value)
                    if isinstance(parsed, (list, tuple)) and parsed:
                        return parsed[0]
                except (ValueError, SyntaxError):
                    pass
        return value

    def to_internal_value(self, data):
        data = data.copy()
        if 'name' in data and not data.get('first_name'):
            name_val = str(data.get('name', '')).strip()
            name_parts = name_val.split(' ', 1)
            data['first_name'] = name_parts[0]
            if len(name_parts) > 1:
                data['last_name'] = name_parts[1]
        if 'first_name' in data and ('last_name' not in data or data.get('last_name') is None):
            data['last_name'] = ''
        if 'last_name' in data and (data['last_name'] is None or str(data['last_name']).strip() == ''):
            data['last_name'] = ''
        if 'class' in data and 'admission_class' not in data:
            data['admission_class'] = self._normalize_value(data.pop('class'))
        if 'admission_class' in data:
            data['admission_class'] = self._normalize_value(data['admission_class'])
        if 'section' in data:
            data['section'] = self._normalize_value(data['section'])
        if 'caste' in data:
            data['caste'] = self._normalize_value(data['caste'])
        if 'house' in data:
            data['house'] = self._normalize_value(data['house'])
        if 'category' in data:
            data['category'] = self._normalize_value(data['category'])
        return super().to_internal_value(data)

    last_name = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        default=''
    )
    admission_class = serializers.CharField(
        write_only=True,
        required=False,
        allow_null=True,
        allow_blank=True
    )
    section = serializers.CharField(
        write_only=True,
        required=False,
        allow_null=True,
        allow_blank=True
    )
    caste = serializers.CharField(write_only=True, required=False, allow_null=True)
    house = serializers.CharField(write_only=True, required=False, allow_null=True)
    category = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    gender = serializers.ChoiceField(
        choices=GENDER_CHOICES,
        required=False,
        allow_null=True
    )
    admission_no = serializers.CharField(required=False, allow_blank=False)
    is_active = serializers.BooleanField(required=False, default=True)

    def validate_admission_no(self, value):
        qs = Admission.objects.filter(admission_no=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"Admission with admission_no '{value}' already exists.")
        return value

    class Meta:
        model = Admission
        fields = [
            'id', 'user', 'user_id', 'password', 'school', 'admission_no', 'pen_no',
            'first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group',
            'category', 'caste', 'aadhaar_no', 'father_name', 'father_occupation',
            'mother_name', 'phone', 'email', 'address', 'admission_class', 'section',
            'sibling_group', 'sibling_group_id', 'sibling_group_name', 'roll_number',
            'bus_route', 'bus_detail', 'driver',
            'hostel', 'sibling_info', 'medium', 'student_type', 'discount_mode',
            'is_bpl', 'dropout', 'tc', 'status', 'house', 'is_active', 'inactive',
            'blocked', 'photo', 'parent_photo', 'tc_document', 'aadhaar_document',
            'date_of_admission', 'ssmid', 'location', 'height', 'weight',
            'religion', 'remarks1', 'remarks2', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['admission_class'] = instance.admission_class.admission_class if instance.admission_class else None
        data['section'] = instance.section.section if instance.section else None
        data['caste_name'] = instance.caste.name if instance.caste else None
        data['house_name'] = instance.house.name if instance.house else None
        data['category'] = instance.category.name if instance.category else None
        data['house_color'] = instance.house.color_code if instance.house else None
        if instance.sibling_group:
            data['sibling_group_id'] = str(instance.sibling_group.id)
            data['sibling_group_name'] = instance.sibling_group.name
        else:
            data['sibling_group_id'] = None
            data['sibling_group_name'] = None
        return data

    def get_user_id(self, instance):
        if instance.user:
            return instance.user.user_id
        return None

    def get_sibling_group_id(self, instance):
        if instance.sibling_group:
            return instance.sibling_group.id
        return None

    def get_sibling_group_name(self, instance):
        if instance.sibling_group:
            return instance.sibling_group.name
        return None

    def _attach_class_and_section(self, validated_data, apply_defaults=False):
        admission_class_code = validated_data.pop('admission_class', None)
        section_code = validated_data.pop('section', None)
        caste_name_input = validated_data.pop('caste', None)
        house_name_input = validated_data.pop('house', None)
        category_input = validated_data.pop('category', None)

        date_of_admission = validated_data.get('date_of_admission')
        if date_of_admission:
            start_year = date_of_admission.year
            year_str = f"{start_year}-{start_year + 1}"
        else:
            current_year = now().year
            year_str = f"{current_year}-{current_year + 1}"

        school = validated_data.get('school')

        admission_class_code = admission_class_code or None
        section_code = section_code or None

        if apply_defaults:
            if admission_class_code and not section_code:
                section_code = "A"
            elif section_code and not admission_class_code:
                admission_class_code = "I"

        if admission_class_code or section_code:
            academic_year = resolve_academic_year(year_str, school=school)
            if admission_class_code:
                academic_class = None
                code_str = str(admission_class_code).strip()
                if code_str.isdigit():
                    academic_class = AcademicClass.objects.filter(pk=int(code_str)).first()
                if not academic_class:
                    academic_class = AcademicClass.objects.filter(admission_class__iexact=code_str).first()
                if not academic_class:
                    num_to_roman = {'1':'I','2':'II','3':'III','4':'IV','5':'V','6':'VI','7':'VII','8':'VIII','9':'IX','10':'X','11':'XI','12':'XII'}
                    mapped_code = num_to_roman.get(code_str, code_str)
                    academic_class, _ = AcademicClass.objects.get_or_create(
                        admission_class=mapped_code,
                        academic_year=academic_year,
                        defaults={'school': school},
                    )
                validated_data['admission_class'] = academic_class
            if section_code:
                section_obj = None
                sec_str = str(section_code).strip()
                if sec_str.isdigit():
                    section_obj = Section.objects.filter(pk=int(sec_str)).first()
                if not section_obj:
                    section_obj = Section.objects.filter(section__iexact=sec_str).first()
                if not section_obj:
                    section_obj, _ = Section.objects.get_or_create(
                        section=sec_str,
                        academic_year=academic_year,
                        defaults={'school': school},
                    )
                validated_data['section'] = section_obj

        if caste_name_input and str(caste_name_input).strip():
            caste_name = str(caste_name_input).strip()
            academic_year = resolve_academic_year(year_str, school=school) if school else None
            caste_obj, _ = Caste.objects.get_or_create(
                name=caste_name,
                defaults={'school': school, 'academic_year': academic_year},
            )
            validated_data['caste'] = caste_obj

        if house_name_input and str(house_name_input).strip():
            house_name = str(house_name_input).strip()
            house_obj, _ = House.objects.get_or_create(
                name=house_name,
                defaults={'school': school},
            )
            validated_data['house'] = house_obj

        if category_input and str(category_input).strip():
            category_name = str(category_input).strip()
            academic_year = resolve_academic_year(year_str, school=school) if school else None
            category_obj, _ = Category.objects.get_or_create(
                name=category_name,
                defaults={'school': school, 'academic_year': academic_year},
            )
            validated_data['category'] = category_obj
        elif 'category' not in validated_data:
            validated_data['category'] = None

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.get('email')
        request = self.context.get('request')

        self._attach_class_and_section(validated_data, apply_defaults=True)

        school = validated_data.get('school')
        if not school and request and hasattr(request.user, 'school'):
            validated_data['school'] = request.user.school

        user = None
        if email:
            user, created = User.objects.get_or_create(email=email)
            if password:
                user.set_password(password)
                user.save()

        admission_no = validated_data.pop('admission_no', None)
        if not admission_no:
            current_year = now().year
            count = Admission.objects.filter(created_at__year=current_year).count() + 1
            admission_no = f"ADM-{current_year}-{str(count).zfill(4)}"

        admission = Admission.objects.create(
            user=user,
            password=password,
            admission_no=admission_no,
            **validated_data
        )

        return admission

    def update(self, instance, validated_data):
        self._attach_class_and_section(validated_data, apply_defaults=False)
        return super().update(instance, validated_data)


class CategorySerializer(serializers.ModelSerializer):
    academic_year = serializers.PrimaryKeyRelatedField(
        queryset=AcademicYear.objects.all(),
        required=False,
        allow_null=True,
    )
    academic_year_display = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'academic_year', 'academic_year_display', 'school']
        read_only_fields = ['id', 'academic_year_display']

    def get_academic_year_display(self, obj):
        return obj.academic_year.year if obj.academic_year else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['academic_year'] = str(instance.academic_year_id) if instance.academic_year_id else None
        data['academic_year_display'] = instance.academic_year.year if instance.academic_year else None
        return data

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Category name must not be blank.")
        qs = Category.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"Category '{value}' already exists.")
        return value
