import { apiClient } from './apiClient';

export interface Visitor {
  id?: number | string;
  name: string;
  phone: string;
  category?: number | string;
  purpose?: string;
  whom_to_meet?: string;
  check_in_time?: string;
  check_out_time?: string;
  id_proof_number?: string;
  badge_number?: string;
}

export const visitorsService = {
  async getVisitorCategories() {
    try {
      const res = await apiClient<any>('/api/visitor-categories/', { method: 'GET' });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async getVisitors(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/visitors/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async createVisitor(data: Visitor) {
    return apiClient<any>('/api/visitors/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getVisitorPasses(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/visitor-passes/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  }
};
