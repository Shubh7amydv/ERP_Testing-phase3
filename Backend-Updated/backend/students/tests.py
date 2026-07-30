from django.test import TestCase
from django.urls import reverse
from django.utils.timezone import now

from rest_framework.test import APIClient

from schools.models import AcademicYear
from .models import AcademicClass, Section, Admission


class AcademicClassAndSectionAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.current_year = f"{now().year}-{now().year + 1}"

    def test_academic_class_create_defaults_year(self):
        response = self.client.post(reverse('academicclass-list'), {'admission_class': 'I'}, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['admission_class'], 'I')

    def test_section_create_defaults_year(self):
        response = self.client.post(reverse('section-list'), {'section': 'A'}, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['section'], 'A')

    def test_academic_class_full_crud(self):
        create_response = self.client.post(
            reverse('academicclass-list'),
            {'admission_class': 'II'},
            format='json',
        )

        self.assertEqual(create_response.status_code, 201)
        academic_class_id = create_response.data['id']

        list_response = self.client.get(reverse('academicclass-list'))
        self.assertEqual(list_response.status_code, 200)
        results = list_response.data.get('results', list_response.data)
        self.assertTrue(any(item['id'] == academic_class_id for item in results))

        update_response = self.client.patch(
            reverse('academicclass-detail', args=[academic_class_id]),
            {'admission_class': 'III'},
            format='json',
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data['admission_class'], 'III')

        delete_response = self.client.delete(reverse('academicclass-detail', args=[academic_class_id]))
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(AcademicClass.objects.filter(pk=academic_class_id).exists())

    def test_section_full_crud(self):
        create_response = self.client.post(
            reverse('section-list'),
            {'section': 'B'},
            format='json',
        )

        self.assertEqual(create_response.status_code, 201)
        section_id = create_response.data['id']

        list_response = self.client.get(reverse('section-list'))
        self.assertEqual(list_response.status_code, 200)
        results = list_response.data.get('results', list_response.data)
        self.assertTrue(any(item['id'] == section_id for item in results))

        update_response = self.client.patch(
            reverse('section-detail', args=[section_id]),
            {'section': 'C'},
            format='json',
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data['section'], 'C')

        delete_response = self.client.delete(reverse('section-detail', args=[section_id]))
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(Section.objects.filter(pk=section_id).exists())
