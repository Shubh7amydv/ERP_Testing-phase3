import { apiClient } from './apiClient';

export interface BusRoute {
  id?: number | string;
  route_name: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  fare?: number;
}

export const transportService = {
  async getBusRoutes(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/bus-routes/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async createBusRoute(data: BusRoute) {
    return apiClient<any>('/api/bus-routes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getBuses(params?: Record<string, any>) {
    try {
      const res = await apiClient<any>('/api/buses/', { method: 'GET', params });
      return res?.data?.results || res?.results || res || [];
    } catch {
      return [];
    }
  },

  async getRouteWiseStudentsReport(params?: Record<string, any>) {
    try {
      return await apiClient<any>('/api/reports/transport/route-wise/', { method: 'GET', params });
    } catch {
      return null;
    }
  }
};
