import { apiClient } from './apiClient';

export const reportsService = {
  async getDashboardOverview() {
    try {
      return await apiClient<any>('/api/dashboard/overview/', { method: 'GET' });
    } catch {
      return null;
    }
  },

  async getRecentActivity() {
    try {
      return await apiClient<any>('/api/dashboard/recent-activity/', { method: 'GET' });
    } catch {
      return null;
    }
  },

  async getAnnouncements() {
    try {
      return await apiClient<any>('/api/dashboard/announcements/', { method: 'GET' });
    } catch {
      return null;
    }
  },

  async getStudentListReport(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/reports/students/list/', { method: 'GET', params });
    } catch {
      return null;
    }
  },

  async getFeeCollectionSummary(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/reports/fees/collection-summary/', { method: 'GET', params });
    } catch {
      return null;
    }
  },

  async getAttendanceDailyReport(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/reports/attendance/daily/', { method: 'GET', params });
    } catch {
      return null;
    }
  }
};
