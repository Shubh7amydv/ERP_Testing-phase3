import { apiClient } from './apiClient';

export interface ExamType {
  id?: number | string;
  name: string;
  description?: string;
  weightage?: number;
  is_active?: boolean;
}

export interface Subject {
  id?: number | string;
  name: string;
  code?: string;
  type?: string;
  subject_type?: string;
  order?: number;
  is_active?: boolean;
}

export interface ClassSubject {
  id?: number | string;
  class_obj?: number | string;
  class_name?: string;
  subject?: number | string;
  subject_name?: string;
  teacher?: number | string;
  teacher_name?: string;
  is_active?: boolean;
}

export interface Exam {
  id?: number | string;
  name: string;
  exam_type?: number | string;
  exam_type_name?: string;
  academic_year?: number | string;
  start_date?: string;
  end_date?: string;
  is_published?: boolean;
}

export interface ExamSchedule {
  id?: number | string;
  exam?: number | string;
  exam_name?: string;
  class_obj?: number | string;
  class_name?: string;
  subject?: number | string;
  subject_name?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  max_marks?: number;
  pass_marks?: number;
}

export interface ExamResult {
  id?: number | string;
  exam_schedule?: number | string;
  student?: number | string;
  student_name?: string;
  roll_no?: string;
  admission_no?: string;
  marks_obtained?: number;
  is_absent?: boolean;
  remarks?: string;
  grade?: string;
}

export interface GradingSystem {
  id?: number | string;
  grade: string;
  min_marks?: number;
  max_marks?: number;
  grade_point?: number;
  description?: string;
}

export interface ReportCard {
  id?: number | string;
  student?: number | string;
  student_name?: string;
  exam?: number | string;
  exam_name?: string;
  total_marks?: number;
  percentage?: number;
  grade?: string;
  remarks?: string;
  results?: any[];
}

export const examinationService = {
  // 1. Exam Types (Terms / Categories)
  async getExamTypes(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/exam-types/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async createExamType(data: ExamType) {
    return apiClient<any>('/api/exam-types/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteExamType(id: number | string) {
    return apiClient<any>(`/api/exam-types/${id}/`, {
      method: 'DELETE',
    });
  },

  // 2. Subjects Master
  async getSubjects(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/subjects/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async createSubject(data: Subject) {
    return apiClient<any>('/api/subjects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteSubject(id: number | string) {
    return apiClient<any>(`/api/subjects/${id}/`, {
      method: 'DELETE',
    });
  },

  // 3. Class Subjects
  async getClassSubjects(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/class-subjects/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async bulkAssignClassSubjects(data: { class_id: string | number; items: any[] }) {
    return apiClient<any>('/api/class-subjects/bulk-assign/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Exams
  async getExams(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/exams/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async createExam(data: Exam) {
    return apiClient<any>('/api/exams/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async publishExam(id: number | string) {
    return apiClient<any>(`/api/exams/${id}/publish/`, {
      method: 'POST',
    });
  },

  async deleteExam(id: number | string) {
    return apiClient<any>(`/api/exams/${id}/`, {
      method: 'DELETE',
    });
  },

  // 5. Exam Schedules
  async getExamSchedules(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/exam-schedules/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async bulkCreateSchedules(data: { exam_id: string | number; schedules: any[] }) {
    return apiClient<any>('/api/exam-schedules/bulk-create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 6. Exam Results & Marks
  async getExamResults(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/exam-results/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async enterMarks(data: ExamResult) {
    return apiClient<any>('/api/exam-results/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async bulkEnterResults(data: { schedule_id: string | number; results: any[] }) {
    return apiClient<any>('/api/exam-results/bulk-results/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 7. Grading System
  async getGradingSystems(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/grading-systems/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async createGradingSystem(data: GradingSystem) {
    return apiClient<any>('/api/grading-systems/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteGradingSystem(id: number | string) {
    return apiClient<any>(`/api/grading-systems/${id}/`, {
      method: 'DELETE',
    });
  },

  // 8. Report Cards
  async getReportCards(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/report-cards/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  // 9. Analytical Reports
  async getClassPerformanceReport(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/exams/reports/class-performance/', { method: 'GET', params });
    } catch {
      return null;
    }
  },

  async getSubjectAnalysisReport(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/exams/reports/subject-analysis/', { method: 'GET', params });
    } catch {
      return null;
    }
  },

  async getToppersReport(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/exams/reports/toppers/', { method: 'GET', params });
    } catch {
      return null;
    }
  },

  async getFailStudentsReport(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/exams/reports/fail-students/', { method: 'GET', params });
    } catch {
      return null;
    }
  },

  async getExamComparisonReport(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/exams/reports/comparison/', { method: 'GET', params });
    } catch {
      return null;
    }
  }
};
