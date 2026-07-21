import { apiClient } from './apiClient';

export interface Book {
  id?: number | string;
  title: string;
  isbn?: string;
  author: string;
  category?: string;
  quantity?: number;
  available_quantity?: number;
}

export interface BookIssue {
  id?: number | string;
  book: number | string;
  member_name: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'issued' | 'returned' | 'overdue';
}

export const libraryService = {
  async getCategories() {
    return apiClient<any>('/api/library/categories/', { method: 'GET' });
  },

  async getBooks(params?: { search?: string; category?: string }) {
    return apiClient<any>('/api/library/books/', { method: 'GET', params });
  },

  async createBook(data: Book) {
    return apiClient<any>('/api/library/books/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getIssues(params?: { status?: string; member?: string }) {
    return apiClient<any>('/api/library/issues/', { method: 'GET', params });
  },

  async issueBook(data: BookIssue) {
    return apiClient<any>('/api/library/issues/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async returnBook(issueId: number | string) {
    return apiClient<any>(`/api/library/issues/${issueId}/return/`, {
      method: 'POST',
    });
  }
};
