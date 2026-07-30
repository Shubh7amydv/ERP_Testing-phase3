from django.contrib import admin
from .models import (
    AcademicClass, Section, SiblingGroup,
    House, Caste, Category, Admission,
)


@admin.register(AcademicClass)
class AcademicClassAdmin(admin.ModelAdmin):
    list_display = ('id', 'admission_class', 'academic_year', 'school')
    list_filter = ('academic_year',)
    search_fields = ('admission_class',)


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'section', 'academic_year', 'school')
    list_filter = ('academic_year',)


@admin.register(SiblingGroup)
class SiblingGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'primary_sibling', 'school')


@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'color_code', 'school')
    search_fields = ('name',)


@admin.register(Caste)
class CasteAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'academic_year', 'school')
    list_filter = ('academic_year',)
    search_fields = ('name',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'academic_year', 'school')
    list_filter = ('academic_year',)
    search_fields = ('name',)


@admin.register(Admission)
class AdmissionAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'admission_no', 'first_name', 'last_name', 'admission_class',
        'section', 'roll_number', 'phone', 'gender', 'is_active', 'display_school'
    )
    list_filter = ('is_active', 'gender', 'admission_class', 'section')
    search_fields = ('admission_no', 'first_name', 'last_name', 'father_name', 'phone')
    raw_id_fields = ('user', 'school', 'admission_class', 'section', 'sibling_group', 'house', 'caste', 'category')

    def display_school(self, obj):
        return obj.school.name if obj.school else '-'
    display_school.short_description = 'School'
