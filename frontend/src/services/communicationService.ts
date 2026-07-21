import { apiClient } from './apiClient';

export interface SMSMessage {
  recipient_type: 'student' | 'teacher' | 'parent' | 'class';
  recipient_id?: string;
  message: string;
}

export interface Notice {
  id?: number | string;
  title: string;
  content: string;
  target_audience?: string;
  publish_date?: string;
}

export const communicationService = {
  async sendSMS(data: SMSMessage) {
    return apiClient<any>('/api/communication/sms/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getNotices() {
    return apiClient<any>('/api/communication/notices/', { method: 'GET' });
  },

  async createNotice(data: Notice) {
    return apiClient<any>('/api/communication/notices/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
