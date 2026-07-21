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

    if not school:
        from schools.models import School
        school = School.objects.first()
        if not school:
            school = School.objects.create(
                name='Default School', code='DEFAULT',
                address='Default Address', city='Default',
                state='Default', pincode='000000',
                phone='0000000000', email='admin@default.com',
            )

    academic_year, _ = AcademicYear.objects.get_or_create(
        school=school,
        year=year_value,
        defaults={
            'start_date': f"{start_year}-04-01",
            'end_date': f"{end_year}-03-31",
        }
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
        if 'class' in data and 'admission_class' not in data:
            data['admission_class'] = self._normalize_value(data.pop('class'))
        if 'admission_class' in data:
            val = str(self._normalize_value(data['admission_class'])).strip()
            CLASS_MAP = {
                'Class 1': 'I', '1': 'I', 'I': 'I',
                'Class 2': 'II', '2': 'II', 'II': 'II',
                'Class 3': 'III', '3': 'III', 'III': 'III',
                'Class 4': 'IV', '4': 'IV', 'IV': 'IV',
                'Class 5': 'V', '5': 'V', 'V': 'V',
                'Class 6': 'VI', '6': 'VI', 'VI': 'VI',
                'Class 7': 'VII', '7': 'VII', 'VII': 'VII',
                'Class 8': 'VIII', '8': 'VIII', 'VIII': 'VIII',
                'Class 9': 'IX', '9': 'IX', 'IX': 'IX',
                'Class 10': 'X', '10': 'X', 'X': 'X',
                'Class 11': 'XI', '11': 'XI', 'XI': 'XI',
                'Class 12': 'XII', '12': 'XII', 'XII': 'XII',
                'Nursery': 'NUR', 'NUR': 'NUR',
                'LKG': 'LKG', 'UKG': 'UKG', 'Play Group': 'PLAY', 'PLAY': 'PLAY'
            }
            data['admission_class'] = CLASS_MAP.get(val, val)

        if 'section' in data:
            val = str(self._normalize_value(data['section'])).replace('Section ', '').strip().upper()
            data['section'] = val

        if 'caste' in data:
            data['caste'] = self._normalize_value(data['caste'])
        if 'house' in data:
            data['house'] = self._normalize_value(data['house'])
        if 'category' in data:
            data['category'] = self._normalize_value(data['category'])
        return super().to_internal_value(data)

    admission_class = serializers.ChoiceField(
        choices=AcademicClass.CLASS_CHOICES,
        write_only=True,
        required=False,
        allow_null=True
    )
    section = serializers.ChoiceField(
        choices=Section.SECTION_CHOICES,
        write_only=True,
        required=False,
        allow_null=True
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
                academic_class, _ = AcademicClass.objects.get_or_create(
                    admission_class=admission_class_code,
                    academic_year=academic_year,
                    defaults={'school': school},
                )
                validated_data['admission_class'] = academic_class
            if section_code:
                section_obj, _ = Section.objects.get_or_create(
                    section=section_code,
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
