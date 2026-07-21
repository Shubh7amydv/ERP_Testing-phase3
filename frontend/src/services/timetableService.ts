import { apiClient } from './apiClient';

export interface TimetableRoutine {
  id?: number | string;
  admission_class: string;
  section: string;
  day_of_week: string;
  period_name: string;
  subject_name: string;
  teacher_name?: string;
  start_time?: string;
  end_time?: string;
}

export const timetableService = {
  async getRoutines(params?: { admission_class?: string; section?: string; teacher?: string }) {
    return apiClient<any>('/api/timetable/routines/', { method: 'GET', params });
  },

  async createRoutine(data: TimetableRoutine) {
    return apiClient<any>('/api/timetable/routines/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPeriods() {
    return apiClient<any>('/api/timetable/periods/', { method: 'GET' });
  }
};
