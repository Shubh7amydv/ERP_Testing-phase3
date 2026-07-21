import { apiClient } from './apiClient';

export interface Employee {
  id?: string;
  employee_id?: string;
  first_name: string;
  last_name?: string;
  designation: string;
  department?: string;
  phone?: string;
  email?: string;
  joining_date?: string;
  salary?: number;
  is_active?: boolean;
}

export interface PayrollRecord {
  id?: number | string;
  employee: string;
  month: string;
  year: number;
  basic_salary: number;
  allowances?: number;
  deductions?: number;
  net_salary: number;
  status: 'draft' | 'paid' | 'cancelled';
}

export const hrService = {
  async getEmployees(params?: { search?: string; department?: string }) {
    return apiClient<any>('/api/hr/employees/', { method: 'GET', params });
  },

  async createEmployee(data: Employee) {
    return apiClient<any>('/api/hr/employees/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getDepartments() {
    return apiClient<any>('/api/hr/departments/', { method: 'GET' });
  },

  async getPayroll(params?: { month?: string; year?: number }) {
    return apiClient<any>('/api/hr/payroll/', { method: 'GET', params });
  },

  async generatePayroll(data: PayrollRecord) {
    return apiClient<any>('/api/hr/payroll/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
