import { apiClient } from './apiClient';

export interface InventoryItem {
  id?: number | string;
  name: string;
  code?: string;
  category?: string;
  quantity: number;
  unit_price?: number;
}

export interface Supplier {
  id?: number | string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const inventoryService = {
  async getCategories() {
    return apiClient<any>('/api/inventory/categories/', { method: 'GET' });
  },

  async getItems(params?: { search?: string; category?: string }) {
    return apiClient<any>('/api/inventory/items/', { method: 'GET', params });
  },

  async createItem(data: InventoryItem) {
    return apiClient<any>('/api/inventory/items/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSuppliers() {
    return apiClient<any>('/api/inventory/suppliers/', { method: 'GET' });
  },

  async createSupplier(data: Supplier) {
    return apiClient<any>('/api/inventory/suppliers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
