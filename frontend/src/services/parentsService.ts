import { apiClient } from './apiClient';

export interface ParentProfile {
  id?: number | string;
  father_name?: string;
  mother_name?: string;
  phone?: string;
  email?: string;
  occupation?: string;
}

export const parentsService = {
  async getParents(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/parents/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async getParentStudentLinks(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/parent-student-links/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async getParentFeedback(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/parent-feedback/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  }
};
