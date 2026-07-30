import { apiClient } from './apiClient';

export interface DocumentItem {
  id?: number | string;
  title: string;
  category?: number | string;
  file_url?: string;
  uploaded_by?: string;
  created_at?: string;
}

export const documentsService = {
  async getCategories() {
    try {
      const res = await apiClient<any>('/api/document-categories/', { method: 'GET' });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async getDocuments(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/documents/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async getTemplates() {
    try {
      const res = await apiClient<any>('/api/document-templates/', { method: 'GET' });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async getTransferCertificates(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/transfer-certificates/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  }
};
