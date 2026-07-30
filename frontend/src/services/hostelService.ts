import { apiClient } from './apiClient';

export interface Hostel {
  id?: number;
  school: string;
  name: string;
  type: 'boys' | 'girls' | 'staff';
  address?: string;
  warden?: string;
  contact?: string;
  total_rooms?: number;
  capacity?: number;
  occupied_rooms?: number;
  occupancy_percentage?: number;
  is_active?: boolean;
}

export interface HostelRoom {
  id?: number;
  hostel: number;
  hostel_name?: string;
  room_number: string;
  floor?: number;
  room_type: 'single' | 'double' | 'triple' | 'dorm';
  capacity: number;
  occupied?: number;
  available_beds?: number;
  is_full?: boolean;
  monthly_fee?: string;
  facilities?: string[];
  is_active?: boolean;
}

export interface HostelAllocation {
  id?: number;
  hostel: number;
  hostel_name?: string;
  room: number;
  room_number?: string;
  student: number;
  student_name?: string;
  academic_year: number;
  allocated_from: string;
  allocated_to?: string;
  status: 'active' | 'vacated' | 'transferred';
  remarks?: string;
}

export const hostelService = {
  // Hostel Buildings
  getHostels: (params?: Record<string, any>) =>
    apiClient<Hostel[]>('/api/hostels/', { params }),
  createHostel: (data: Partial<Hostel>) =>
    apiClient<Hostel>('/api/hostels/', { method: 'POST', body: JSON.stringify(data) }),
  updateHostel: (id: number, data: Partial<Hostel>) =>
    apiClient<Hostel>(`/api/hostels/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHostel: (id: number) =>
    apiClient(`/api/hostels/${id}/`, { method: 'DELETE' }),

  // Hostel Rooms
  getRooms: (params?: Record<string, any>) =>
    apiClient<HostelRoom[]>('/api/hostel-rooms/', { params }),
  createRoom: (data: Partial<HostelRoom>) =>
    apiClient<HostelRoom>('/api/hostel-rooms/', { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (id: number, data: Partial<HostelRoom>) =>
    apiClient<HostelRoom>(`/api/hostel-rooms/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoom: (id: number) =>
    apiClient(`/api/hostel-rooms/${id}/`, { method: 'DELETE' }),

  // Hostel Allocations
  getAllocations: (params?: Record<string, any>) =>
    apiClient<HostelAllocation[]>('/api/hostel-allocations/', { params }),
  allocateRoom: (data: Partial<HostelAllocation>) =>
    apiClient<HostelAllocation>('/api/hostel-allocations/', { method: 'POST', body: JSON.stringify(data) }),
  vacateRoom: (id: number) =>
    apiClient<{ status: string }>(`/api/hostel-allocations/${id}/vacate/`, { method: 'POST' }),
};
