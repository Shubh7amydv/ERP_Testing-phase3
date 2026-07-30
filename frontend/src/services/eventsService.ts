import { apiClient } from './apiClient';

export interface EventType {
  id?: number | string;
  name: string;
  color?: string;
  description?: string;
}

export interface EventItem {
  id?: number | string;
  title: string;
  event_type?: number | string;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
  is_public?: boolean;
}

export const eventsService = {
  async getEventTypes() {
    try {
      const res = await apiClient<any>('/api/event-types/', { method: 'GET' });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async getEvents(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/events/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async createEvent(data: EventItem) {
    return apiClient<any>('/api/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSchoolCalendars(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/school-calendars/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  }
};
