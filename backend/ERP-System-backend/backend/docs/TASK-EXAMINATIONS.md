# Task: Examinations & Results Module (Module 4)

> **Assigned To:** Sudipto (API Endpoints) | Varun (Database/Models)
> **Reference:** `docs/ERP-MODULE-PLAN.md` Section 7
> **Tech Stack:** Django 6 + DRF + PostgreSQL
> **Depends On:** Module 0 (Auth), Module 1 (School), Module 2 (Students)

---

## Current State

- No `examinations` app exists
- No exam/grade system in the ERP
- `AcademicClass`, `Section` models exist in `students` app
- `Admission` model exists in `students` app (used as Student)
- `School`, `AcademicYear` models exist in `schools` app
- `accounts.User` model exists for User
- No subject management system
- No report card generation
- No grading system

---

## Overview: Models to Create (9 Models)

| # | Model | Purpose |
|---|-------|---------|
| 1 | `ExamType` | Types of exams (Unit Test, Mid Term, Final, etc.) |
| 2 | `Subject` | Subjects with max/passing marks |
| 3 | `ClassSubject` | Mapping: which subject is taught in which class |
| 4 | `Exam` | Exam instance (e.g. "Mid Term Exam 2025") |
| 5 | `ExamSchedule` | Per-subject schedule within an exam (date, time, room) |
| 6 | `ExamResult` | Per-student marks for each subject in an exam |
| 7 | `GradingSystem` | Grade definitions (A1, A2, B1... with min/max %) |
| 8 | `ReportCard` | Generated report card per student per exam |
| 9 | `ClassResultSummary` | Class/section/subject-wise result stats |

---

## TASKS FOR VARUN (Database / Models)

### Task V1: Create `examinations` Django App
- Run `python manage.py startapp examinations`
- Add `'examinations'` to `INSTALLED_APPS` in `config/settings.py`

### Task V2: Create `ExamType` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `name` - CharField(100) e.g. "Unit Test 1", "Mid Term", "Final Exam", "Pre-Board"
- `description` - TextField (blank)
- `weightage` - PositiveIntegerField (default=100) - percentage weightage in final result
- `is_active` - BooleanField (default=True)
- `created_at` - DateTimeField (auto_now_add)

**Constraints:** unique_together = (school, name)
**Ordering:** name

---

### Task V3: Create `Subject` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `name` - CharField(100) e.g. "Mathematics", "Science", "English"
- `code` - CharField(10) e.g. "MATH", "SCI", "ENG"
- `type` - CharField(15) choices: theory / practical / both
- `max_marks` - PositiveIntegerField (default=100)
- `passing_marks` - PositiveIntegerField (default=33)
- `is_active` - BooleanField (default=True)
- `created_at` - DateTimeField (auto_now_add)

**Constraints:** unique_together = (school, code)
**Ordering:** name

---

### Task V4: Create `ClassSubject` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `class_obj` - FK -> AcademicClass (CASCADE) [from students app]
- `subject` - FK -> Subject (CASCADE)
- `teacher` - FK -> User (SET_NULL, null=True, blank=True) - assigned teacher
- `is_active` - BooleanField (default=True)
- `created_at` - DateTimeField (auto_now_add)

**Constraints:** unique_together = (school, class_obj, subject)
**Ordering:** class_obj, subject

---

### Task V5: Create `Exam` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `exam_type` - FK -> ExamType (CASCADE)
- `name` - CharField(200) e.g. "Mid Term Exam 2025-26"
- `academic_year` - FK -> AcademicYear (CASCADE) [from schools app]
- `start_date` - DateField
- `end_date` - DateField
- `result_date` - DateField (null=True, blank=True) - when results will be declared
- `is_published` - BooleanField (default=False) - results published to students
- `published_by` - FK -> User (SET_NULL, null=True, blank=True)
- `created_at` - DateTimeField (auto_now_add)
- `updated_at` - DateTimeField (auto_now)

**Ordering:** -start_date

---

### Task V6: Create `ExamSchedule` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `exam` - FK -> Exam (CASCADE)
- `subject` - FK -> Subject (CASCADE)
- `class_obj` - FK -> AcademicClass (CASCADE)
- `date` - DateField
- `start_time` - TimeField
- `end_time` - TimeField
- `max_marks` - PositiveIntegerField
- `passing_marks` - PositiveIntegerField
- `room_no` - CharField(20, blank=True)
- `instructions` - TextField (blank)
- `created_at` - DateTimeField (auto_now_add)

**Constraints:** unique_together = (exam, subject, class_obj)
**Ordering:** date, start_time

---

### Task V7: Create `ExamResult` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `exam` - FK -> Exam (CASCADE)
- `student` - FK -> Admission (CASCADE) [from students app]
- `schedule` - FK -> ExamSchedule (CASCADE)
- `marks_obtained` - DecimalField(5,2) (null=True, blank=True) - null = absent
- `grade` - CharField(2, blank=True)
- `remarks` - CharField(200, blank=True)
- `is_absent` - BooleanField (default=False)
- `graded_by` - FK -> User (SET_NULL, null=True, blank=True)
- `created_at` - DateTimeField (auto_now_add)
- `updated_at` - DateTimeField (auto_now)

**Constraints:** unique_together = (exam, student, schedule)
**Ordering:** -created_at

---

### Task V8: Create `GradingSystem` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `name` - CharField(100) e.g. "CBSE Grading", "Percentage"
- `grades` - JSONField - e.g. `[{"grade":"A1","min":91,"max":100}, {"grade":"A2","min":81,"max":90}, ...]`
- `is_default` - BooleanField (default=False) - only one default per school
- `is_active` - BooleanField (default=True)
- `created_at` - DateTimeField (auto_now_add)

**Constraints:** unique_together = (school, name)
**Ordering:** name

**Note:** Add a `save()` override to ensure only one `is_default=True` per school.

---

### Task V9: Create `ReportCard` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `exam` - FK -> Exam (CASCADE)
- `student` - FK -> Admission (CASCADE)
- `total_marks` - DecimalField(6,2) - sum of all max_marks
- `marks_obtained` - DecimalField(6,2) - sum of all marks obtained
- `percentage` - DecimalField(5,2)
- `grade` - CharField(2, blank=True)
- `rank` - PositiveIntegerField (null=True, blank=True)
- `status` - CharField(10) choices: pass / fail / compartment
- `remarks` - TextField (blank)
- `generated_at` - DateTimeField (auto_now_add)

**Constraints:** unique_together = (exam, student)
**Ordering:** -generated_at

---

### Task V10: Create `ClassResultSummary` Model
File: `examinations/models.py`

**Fields:**
- `school` - FK -> School (CASCADE)
- `exam` - FK -> Exam (CASCADE)
- `class_obj` - FK -> AcademicClass (CASCADE)
- `section` - FK -> Section (CASCADE)
- `subject` - FK -> Subject (CASCADE)
- `total_students` - PositiveIntegerField
- `appeared` - PositiveIntegerField
- `passed` - PositiveIntegerField
- `failed` - PositiveIntegerField
- `pass_pct` - DecimalField(5,2)
- `highest` - DecimalField(5,2)
- `lowest` - DecimalField(5,2)
- `average` - DecimalField(5,2)
- `created_at` - DateTimeField (auto_now_add)

**Constraints:** unique_together = (exam, class_obj, section, subject)
**Ordering:** class_obj, section, subject

---

### Task V11: Create Helper Functions
File: `examinations/models.py`

Add these utility functions at the bottom:

1. **`calculate_grade(marks_obtained, max_marks, grading_system)`** - Given marks and a grading system, return the grade string.
2. **`generate_report_card(exam, student)`** - Calculate total_marks, marks_obtained, percentage, grade, status (pass/fail/compartment) for a student in an exam. Create/update ReportCard.
3. **`generate_class_result_summary(exam, class_obj, section)`** - Calculate appeared, passed, failed, pass_pct, highest, lowest, average for each subject. Create/update ClassResultSummary.

---

### Task V12: Register Models in Admin
File: `examinations/admin.py`

Register all 9 models with appropriate admin classes:
- `ExamType` - list_display: name, school, weightage, is_active
- `Subject` - list_display: name, code, type, max_marks, passing_marks, is_active
- `ClassSubject` - list_display: class_obj, subject, teacher, is_active
- `Exam` - list_display: name, exam_type, academic_year, start_date, end_date, is_published
- `ExamSchedule` - list_display: exam, subject, class_obj, date, start_time, end_time, max_marks
- `ExamResult` - list_display: exam, student, schedule, marks_obtained, grade, is_absent
- `GradingSystem` - list_display: name, is_default, is_active
- `ReportCard` - list_display: exam, student, marks_obtained, percentage, grade, rank, status
- `ClassResultSummary` - list_display: exam, class_obj, section, subject, pass_pct, average

### Task V13: Run Migrations
```bash
python manage.py makemigrations examinations
python manage.py migrate
```

---

## TASKS FOR SUDIPTO (API Endpoints)

### Task S1: Create Serializers
File: `examinations/serializers.py`

Create these serializers (describe fields, not full code):

**ExamTypeSerializer:**
- fields: id, school, name, description, weightage, is_active, created_at
- read_only: created_at

**SubjectSerializer:**
- fields: id, school, name, code, type, max_marks, passing_marks, is_active, created_at
- read_only: created_at

**ClassSubjectSerializer:**
- fields: id, school, class_obj, subject, teacher, is_active, created_at
- read_only: created_at
- extra: class_name (read_only), subject_name (read_only), teacher_name (read_only)

**ExamSerializer:**
- fields: id, school, exam_type, name, academic_year, start_date, end_date, result_date, is_published, published_by, created_at, updated_at
- read_only: created_at, updated_at, published_by
- extra: exam_type_name (read_only), academic_year_name (read_only)

**ExamScheduleSerializer:**
- fields: id, school, exam, subject, class_obj, date, start_time, end_time, max_marks, passing_marks, room_no, instructions, created_at
- read_only: created_at
- extra: subject_name (read_only), class_name (read_only), exam_name (read_only)

**ExamResultSerializer:**
- fields: id, school, exam, student, schedule, marks_obtained, grade, remarks, is_absent, graded_by, created_at, updated_at
- read_only: created_at, updated_at, graded_by, grade
- extra: student_name (read_only), subject_name (read_only via schedule)

**GradingSystemSerializer:**
- fields: id, school, name, grades, is_default, is_active, created_at
- read_only: created_at

**ReportCardSerializer:**
- fields: id, school, exam, student, total_marks, marks_obtained, percentage, grade, rank, status, remarks, generated_at
- read_only: generated_at
- extra: student_name (read_only), exam_name (read_only)

**ClassResultSummarySerializer:**
- fields: id, school, exam, class_obj, section, subject, total_students, appeared, passed, failed, pass_pct, highest, lowest, average, created_at
- read_only: created_at
- extra: class_name (read_only), section_name (read_only), subject_name (read_only)

**BulkEnterResultsSerializer (non-model):**
- exam_id, class_id, section_id, schedule_id
- results: List of {student_id, marks_obtained, is_absent, remarks}

**BulkCreateScheduleSerializer (non-model):**
- exam_id, class_id
- schedules: List of {subject_id, date, start_time, end_time, max_marks, passing_marks, room_no, instructions}

---

### Task S2: Create Custom Permissions
File: `examinations/permissions.py`

Reuse same pattern from other modules:
- `IsSuperAdmin` - superuser
- `IsSchoolAdmin` - School Admin role
- `IsTeacher` - School Admin, Teacher, Vice Principal, Principal roles
- `IsSchoolMember` - authenticated + has school

---

### Task S3: Create ExamType Views
File: `examinations/views.py`

**ExamTypeViewSet (ModelViewSet):**
- serializer: ExamTypeSerializer
- permissions: IsSchoolMember
- filter: school, is_active
- queryset: filter by request.user.school

---

### Task S4: Create Subject Views
File: `examinations/views.py`

**SubjectViewSet (ModelViewSet):**
- serializer: SubjectSerializer
- permissions: IsSchoolMember
- filter: school, type, is_active
- queryset: filter by request.user.school

---

### Task S5: Create ClassSubject Views
File: `examinations/views.py`

**ClassSubjectViewSet (ModelViewSet):**
- serializer: ClassSubjectSerializer
- permissions: IsSchoolMember
- filter: school, class_obj, subject, is_active
- queryset: filter by request.user.school, select_related

**Custom Actions:**
- `bulk-assign` (POST) - Bulk assign subjects to a class
  - Input: class_id, list of {subject_id, teacher_id (optional)}
  - Create ClassSubject entries, skip duplicates

---

### Task S6: Create Exam Views
File: `examinations/views.py`

**ExamViewSet (ModelViewSet):**
- serializer: ExamSerializer
- permissions: IsSchoolMember
- filter: school, exam_type, academic_year, is_published
- queryset: filter by request.user.school

**Custom Actions:**
- `publish` (POST, detail) - Publish results for an exam
  - Set is_published=True, published_by=request.user
  - Trigger report card generation for all students

---

### Task S7: Create ExamSchedule Views
File: `examinations/views.py`

**ExamScheduleViewSet (ModelViewSet):**
- serializer: ExamScheduleSerializer
- permissions: IsSchoolMember
- filter: school, exam, subject, class_obj
- queryset: filter by request.user.school

**Custom Actions:**
- `bulk-create` (POST) - Bulk create schedules for an exam + class
  - Input: exam_id, class_id, list of {subject_id, date, start_time, end_time, max_marks, passing_marks, room_no, instructions}
  - Create ExamSchedule entries, skip duplicates

---

### Task S8: Create ExamResult Views
File: `examinations/views.py`

**ExamResultViewSet (ModelViewSet):**
- serializer: ExamResultSerializer
- permissions: IsSchoolMember
- filter: school, exam, student, schedule
- queryset: filter by request.user.school

**Custom Actions:**
- `bulk-enter` (POST) - Bulk enter results for a class/section/subject
  - Input: exam_id, class_id, section_id, schedule_id, list of {student_id, marks_obtained, is_absent, remarks}
  - Create/update ExamResult entries
  - Auto-calculate grade using GradingSystem

- `import` (POST) - Import results from CSV/Excel
  - Accept file upload, parse, bulk create results

- `student/{student_id}` (GET) - Get all results for a student
  - Filter by student_id, return results grouped by exam

- `class/{class_id}` (GET) - Get class results for an exam
  - Filter by exam_id + class_id, return all student results

---

### Task S9: Create GradingSystem Views
File: `examinations/views.py`

**GradingSystemViewSet (ModelViewSet):**
- serializer: GradingSystemSerializer
- permissions: IsSchoolMember
- filter: school, is_active, is_default
- queryset: filter by request.user.school

**Custom Actions:**
- `set-default` (POST, detail) - Set as default grading system
  - Unset other defaults for this school, set this one

---

### Task S10: Create ReportCard Views
File: `examinations/views.py`

**ReportCardViewSet (ModelViewSet):**
- serializer: ReportCardSerializer
- permissions: IsSchoolMember
- filter: school, exam, student
- queryset: filter by request.user.school

**Custom Actions:**
- `generate` (POST) - Generate report cards for an exam
  - Input: exam_id
  - For each student in the exam, call generate_report_card() helper
  - Auto-calculate totals, percentage, grade, rank, status

- `download` (GET, detail) - Download report card PDF
  - Return PDF file URL (or generate PDF)

---

### Task S11: Create Exam Report Views
File: `examinations/views.py`

**ClassPerformanceReportView (APIView):**
- Permission: IsSchoolMember
- GET - Class performance analysis
- Input params: exam_id, class_id
- Return: per-subject pass%, average, highest, lowest

**SubjectAnalysisReportView (APIView):**
- Permission: IsSchoolMember
- GET - Subject-wise analysis across classes
- Input params: exam_id, subject_id
- Return: per-class-section pass%, average

**ToppersReportView (APIView):**
- Permission: IsSchoolMember
- GET - Top N students in an exam
- Input params: exam_id, class_id, limit (default 10)
- Return: sorted by percentage descending

**FailStudentsReportView (APIView):**
- Permission: IsSchoolMember
- GET - Students who failed
- Input params: exam_id, class_id (optional)
- Return: students with status='fail' or 'compartment'

**ExamComparisonReportView (APIView):**
- Permission: IsSchoolMember
- GET - Compare results across exams
- Input params: exam_ids (comma-separated), class_id
- Return: per-exam pass%, average

---

### Task S12: Create URL Patterns
File: `examinations/urls.py`

**Router registrations:**
- `exam-types/` -> ExamTypeViewSet
- `subjects/` -> SubjectViewSet
- `class-subjects/` -> ClassSubjectViewSet
- `exams/` -> ExamViewSet
- `exam-schedules/` -> ExamScheduleViewSet
- `exam-results/` -> ExamResultViewSet
- `grading-systems/` -> GradingSystemViewSet
- `report-cards/` -> ReportCardViewSet

**Custom URL patterns:**
- `exams/reports/class-performance/` -> ClassPerformanceReportView
- `exams/reports/subject-analysis/` -> SubjectAnalysisReportView
- `exams/reports/toppers/` -> ToppersReportView
- `exams/reports/fail-students/` -> FailStudentsReportView
- `exams/reports/comparison/` -> ExamComparisonReportView

### Task S13: Wire URLs in `config/urls.py`
Add to root `urls.py`:
```python
path('api/', include('examinations.urls')),
```

### Task S14: Test All Endpoints
Create test data and verify:
1. CRUD for ExamType
2. CRUD for Subject
3. CRUD for ClassSubject + bulk-assign
4. CRUD for Exam + publish
5. CRUD for ExamSchedule + bulk-create
6. CRUD for ExamResult + bulk-enter + import + student/{id} + class/{id}
7. CRUD for GradingSystem + set-default
8. CRUD for ReportCard + generate + download
9. Class performance report
10. Subject analysis report
11. Toppers report
12. Fail students report
13. Exam comparison report

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Exam Types** | | |
| GET | `/api/exam-types/` | List exam types |
| POST | `/api/exam-types/` | Create exam type |
| GET | `/api/exam-types/{id}/` | Exam type detail |
| PUT | `/api/exam-types/{id}/` | Update exam type |
| DELETE | `/api/exam-types/{id}/` | Delete exam type |
| **Subjects** | | |
| GET | `/api/subjects/` | List subjects |
| POST | `/api/subjects/` | Create subject |
| GET | `/api/subjects/{id}/` | Subject detail |
| PUT | `/api/subjects/{id}/` | Update subject |
| DELETE | `/api/subjects/{id}/` | Delete subject |
| **Class Subjects** | | |
| GET | `/api/class-subjects/` | List class-subject mappings |
| POST | `/api/class-subjects/` | Assign subject to class |
| GET | `/api/class-subjects/{id}/` | Detail |
| PUT | `/api/class-subjects/{id}/` | Update |
| DELETE | `/api/class-subjects/{id}/` | Remove mapping |
| POST | `/api/class-subjects/bulk-assign/` | Bulk assign subjects to class |
| **Exams** | | |
| GET | `/api/exams/` | List exams |
| POST | `/api/exams/` | Create exam |
| GET | `/api/exams/{id}/` | Exam detail |
| PUT | `/api/exams/{id}/` | Update exam |
| DELETE | `/api/exams/{id}/` | Delete exam |
| POST | `/api/exams/{id}/publish/` | Publish exam results |
| **Exam Schedules** | | |
| GET | `/api/exam-schedules/` | List schedules |
| POST | `/api/exam-schedules/` | Create schedule |
| GET | `/api/exam-schedules/{id}/` | Schedule detail |
| PUT | `/api/exam-schedules/{id}/` | Update schedule |
| DELETE | `/api/exam-schedules/{id}/` | Delete schedule |
| POST | `/api/exam-schedules/bulk-create/` | Bulk create schedules |
| **Exam Results** | | |
| GET | `/api/exam-results/` | List results |
| POST | `/api/exam-results/` | Enter single result |
| GET | `/api/exam-results/{id}/` | Result detail |
| PUT | `/api/exam-results/{id}/` | Update result |
| DELETE | `/api/exam-results/{id}/` | Delete result |
| POST | `/api/exam-results/bulk-enter/` | Bulk enter results for class |
| POST | `/api/exam-results/import/` | Import from CSV/Excel |
| GET | `/api/exam-results/student/{student_id}/` | Student results |
| GET | `/api/exam-results/class/{class_id}/` | Class results |
| **Grading Systems** | | |
| GET | `/api/grading-systems/` | List grading systems |
| POST | `/api/grading-systems/` | Create grading system |
| GET | `/api/grading-systems/{id}/` | Detail |
| PUT | `/api/grading-systems/{id}/` | Update |
| DELETE | `/api/grading-systems/{id}/` | Delete |
| POST | `/api/grading-systems/{id}/set-default/` | Set as default |
| **Report Cards** | | |
| GET | `/api/report-cards/` | List report cards |
| GET | `/api/report-cards/{id}/` | Report card detail |
| POST | `/api/report-cards/generate/` | Generate report cards for exam |
| GET | `/api/report-cards/{id}/download/` | Download PDF |
| **Reports** | | |
| GET | `/api/exams/reports/class-performance/` | Class performance analysis |
| GET | `/api/exams/reports/subject-analysis/` | Subject-wise analysis |
| GET | `/api/exams/reports/toppers/` | Top students |
| GET | `/api/exams/reports/fail-students/` | Failed students |
| GET | `/api/exams/reports/comparison/` | Compare across exams |

---

## Implementation Order (Suggested)

### Phase 1: Foundation (Day 1)
1. **Varun:** Create app + ExamType + Subject + ClassSubject models (V1-V4)
2. **Sudipto:** Create serializers (S1) + permissions (S2)

### Phase 2: Exam Setup (Day 2)
3. **Varun:** Exam + ExamSchedule models (V5-V6)
4. **Sudipto:** ExamType, Subject, ClassSubject views (S3-S5)

### Phase 3: Results & Grading (Day 3)
5. **Varun:** ExamResult + GradingSystem models (V7-V8)
6. **Sudipto:** Exam + ExamSchedule views (S6-S7)

### Phase 4: Report Cards (Day 4)
7. **Varun:** ReportCard + ClassResultSummary models (V9-V10)
8. **Sudipto:** ExamResult views + bulk-enter + import (S8)

### Phase 5: Reports & Integration (Day 5)
9. **Varun:** Helper functions (V11) + admin (V12) + migrations (V13)
10. **Sudipto:** GradingSystem + ReportCard views (S9-S10)
11. **Sudipto:** Exam report views (S11)

### Phase 6: Final Wiring (Day 6)
12. **Sudipto:** URL patterns + wire in root urls (S12-S13)
13. **Both:** Testing all endpoints (S14)

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| djangorestframework | 3.17.1 | Already installed |
| django-filter | Latest | For query parameter filtering |
| Django | 6.0.5 | Already installed |
| openpyxl | Latest (optional) | For Excel import of results |

---

## Notes

- `students.Admission` model is used as the Student model (already exists)
- `students.AcademicClass` model is used for Class (already exists)
- `students.Section` model is used for Section (already exists)
- `schools.School` model is used for School (already exists)
- `schools.AcademicYear` model is used for Academic Year (already exists)
- `accounts.User` model is used for User (already exists)
- Marks can be null (for absent students) or a decimal value
- Grade is auto-calculated from GradingSystem when result is entered
- ReportCard is auto-generated when exam is published
- Rank is calculated within the exam (not globally)
- `is_absent` flag is separate from `marks_obtained=null` for clarity
- GradingSystem `grades` JSONField stores array of {grade, min, max}
- Only one GradingSystem can be default per school
- ExamSchedule allows different max_marks per subject per class
- `compartment` status = failed in 1-2 subjects (can reappear)
