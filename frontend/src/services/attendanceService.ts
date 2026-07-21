import { apiClient } from './apiClient';

export interface AttendanceRecord {
  id?: string;
  student?: string;
  student_name?: string;
  admission_class?: string;
  section?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  remarks?: string;
}

export const attendanceService = {
  async getAttendance(params?: { date?: string; admission_class?: string; section?: string; student?: string }) {
    return apiClient<any>('/api/attendance/', {
      method: 'GET',
      params,
    });
  },

  async markAttendance(data: AttendanceRecord | AttendanceRecord[]) {
    return apiClient<any>('/api/attendance/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPeriods() {
    return apiClient<any>('/api/attendance/periods/', { method: 'GET' });
  },

  async getHolidays() {
    return apiClient<any>('/api/attendance/holidays/', { method: 'GET' });
  },

  async getLeaves() {
    return apiClient<any>('/api/attendance/leaves/', { method: 'GET' });
  }
};
