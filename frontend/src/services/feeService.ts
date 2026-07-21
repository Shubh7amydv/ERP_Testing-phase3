import { apiClient } from './apiClient';

export interface FeeCategory {
  id?: number | string;
  name: string;
  description?: string;
}

export interface FeeHead {
  id?: number | string;
  category?: number | string;
  name: string;
  code?: string;
  is_active?: boolean;
}

export interface FeePayment {
  id?: number | string;
  student: string;
  amount: number;
  payment_mode: 'cash' | 'upi' | 'card' | 'netbanking' | 'cheque';
  transaction_id?: string;
  remarks?: string;
}

export const feeService = {
  async getCategories() {
    return apiClient<any>('/api/fees/categories/', { method: 'GET' });
  },

  async getHeads() {
    return apiClient<any>('/api/fees/heads/', { method: 'GET' });
  },

  async getStructures() {
    return apiClient<any>('/api/fees/structures/', { method: 'GET' });
  },

  async getAssignments(params?: { student?: string; class?: string }) {
    return apiClient<any>('/api/fees/assignments/', { method: 'GET', params });
  },

  async getPayments(params?: { student?: string }) {
    return apiClient<any>('/api/fees/payments/', { method: 'GET', params });
  },

  async collectPayment(data: FeePayment) {
    return apiClient<any>('/api/fees/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getReceipts() {
    return apiClient<any>('/api/fees/receipts/', { method: 'GET' });
  }
};
