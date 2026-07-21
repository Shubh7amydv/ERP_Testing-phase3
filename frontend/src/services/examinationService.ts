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
  subject_type?: string;
}

export interface MarkEntry {
  id?: number | string;
  exam?: number | string;
  student: string;
  subject: number | string;
  marks_obtained: number;
  max_marks?: number;
  remarks?: string;
}

export const examinationService = {
  async getExamTypes() {
    return apiClient<any>('/api/exam-types/', { method: 'GET' });
  },

  async createExamType(data: ExamType) {
    return apiClient<any>('/api/exam-types/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSubjects() {
    return apiClient<any>('/api/subjects/', { method: 'GET' });
  },

  async getExams() {
    return apiClient<any>('/api/exams/', { method: 'GET' });
  },

  async getMarks(params?: { exam?: string; student?: string; subject?: string }) {
    return apiClient<any>('/api/marks/', { method: 'GET', params });
  },

  async enterMarks(data: MarkEntry | MarkEntry[]) {
    return apiClient<any>('/api/marks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
