import { apiClient } from './apiClient';

// Backend Admission Interface
export interface BackendAdmission {
  id?: string;
  admission_no?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  category?: string;
  caste?: string;
  religion?: string;
  aadhaar_no?: string;
  father_name?: string;
  father_occupation?: string;
  mother_name?: string;
  admission_class: string;
  section: string;
  roll_number?: string | number;
  house?: string;
  bus_route?: string;
  medium?: string;
  date_of_admission?: string;
  status?: string;
  is_active?: boolean;
  photo?: string | File;
  parent_photo?: string | File;
  tc_document?: string | File;
  aadhaar_document?: string | File;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export const studentService = {
  // 1. Auth: Login
  async login(email: string, password: string) {
    const data = await apiClient<{ access?: string; access_token?: string; refresh?: string; user?: any }>(
      '/api/auth/login/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    const token = data?.access || data?.access_token;
    if (token) {
      localStorage.setItem('access_token', token);
    }
    return data;
  },

  // 2. Admissions: List (Paginated & Filtered)
  async getAdmissions(params?: {
    page?: number;
    limit?: number;
    year?: string;
    search?: string;
    admission_class?: string;
    section?: string;
    gender?: string;
    house?: string;
    ordering?: string;
  }) {
    return apiClient<PaginatedResponse<BackendAdmission> | BackendAdmission[]>('/api/admissions/', {
      method: 'GET',
      params,
    });
  },

  // 3. Admissions: Create (supports JSON object or FormData for file uploads)
  async createAdmission(data: BackendAdmission | FormData) {
    const isFormData = data instanceof FormData;
    return apiClient<BackendAdmission>('/api/admissions/', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  // 4. Admissions: Retrieve by ID
  async getAdmissionById(id: string) {
    return apiClient<BackendAdmission>(`/api/admissions/${id}/`, {
      method: 'GET',
    });
  },

  // 5. Admissions: Full Update (PUT)
  async updateAdmission(id: string, data: BackendAdmission | FormData) {
    const isFormData = data instanceof FormData;
    return apiClient<BackendAdmission>(`/api/admissions/${id}/`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  // 6. Admissions: Partial Update (PATCH)
  async partialUpdateAdmission(id: string, data: Partial<BackendAdmission>) {
    return apiClient<BackendAdmission>(`/api/admissions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 7. Admissions: Delete (Soft Delete)
  async deleteAdmission(id: string) {
    return apiClient(`/api/admissions/${id}/`, {
      method: 'DELETE',
    });
  },

  // 8. Admissions: Filter by Groups
  async filterByGroups(params: { year?: string; groups?: string; page?: number; limit?: number; ordering?: string }) {
    return apiClient<PaginatedResponse<BackendAdmission>>('/api/admissions/filter-by-groups/', {
      method: 'GET',
      params,
    });
  },

  // 9. Admissions: Class-wise Total Students Statistics
  async getClassWiseStats(year?: string) {
    return apiClient<any>('/api/admissions/class-wise-total-students/', {
      method: 'GET',
      params: { year },
    });
  },

  // 10. Admissions: Bulk Update
  async bulkUpdateAdmissions(updates: Array<{ id: string; [key: string]: any }>) {
    return apiClient<BackendAdmission[]>('/api/admissions/bulk-update/', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // 11. Master Classes API
  async getClasses(params?: { page?: number; limit?: number; year?: string; search?: string }) {
    return apiClient<PaginatedResponse<any> | any[]>('/api/classes/', { method: 'GET', params });
  },

  async createClass(data: { admission_class: string; academic_year?: number }) {
    return apiClient('/api/classes/', { method: 'POST', body: JSON.stringify(data) });
  },

  // 12. Master Sections API
  async getSections(params?: { page?: number; limit?: number; year?: string; search?: string }) {
    return apiClient<PaginatedResponse<any> | any[]>('/api/sections/', { method: 'GET', params });
  },

  async createSection(data: { section: string; academic_year?: number }) {
    return apiClient('/api/sections/', { method: 'POST', body: JSON.stringify(data) });
  },

  // 13. Master Castes API
  async getCastes(params?: { page?: number; limit?: number; search?: string }) {
    return apiClient<PaginatedResponse<any> | any[]>('/api/castes/', { method: 'GET', params });
  },

  async createCaste(data: { caste_name: string; academic_year?: number }) {
    return apiClient('/api/castes/', { method: 'POST', body: JSON.stringify(data) });
  },

  // 14. Master Houses API
  async getHouses(params?: { page?: number; limit?: number; search?: string }) {
    return apiClient<PaginatedResponse<any> | any[]>('/api/houses/', { method: 'GET', params });
  },

  async createHouse(data: { house_name: string; color_code?: string }) {
    return apiClient('/api/houses/', { method: 'POST', body: JSON.stringify(data) });
  },

  // 15. Master Categories API
  async getCategories(params?: { page?: number; limit?: number; search?: string }) {
    return apiClient<PaginatedResponse<any> | any[]>('/api/categories/', { method: 'GET', params });
  },

  async createCategory(data: { name: string; academic_year?: number }) {
    return apiClient('/api/categories/', { method: 'POST', body: JSON.stringify(data) });
  },

  // 16. Sibling Groups API
  async getSiblingGroups(params?: { year?: string }) {
    return apiClient<any[]>('/api/sibling-groups/', { method: 'GET', params });
  },

  async addToSiblingGroup(data: { sibling_group_name: string; admission_ids: string[]; primary_sibling?: string }) {
    return apiClient('/api/sibling-groups/add-to-sibling-group/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 17. Academic Years API
  async getAcademicYears(schoolId: string) {
    return apiClient<any[] | { results?: any[] }>(`/api/schools/${schoolId}/academic-years/`, { method: 'GET' });
  },

  async createAcademicYear(schoolId: string, data: { year: string; start_date: string; end_date: string; is_current?: boolean }) {
    return apiClient(`/api/schools/${schoolId}/academic-years/create/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async setCurrentAcademicYear(schoolId: string, yearId: number) {
    return apiClient(`/api/schools/${schoolId}/academic-years/${yearId}/set-current/`, {
      method: 'POST',
    });
  },

  // 18. Schools List API
  async getSchools() {
    return apiClient<any[]>('/api/schools/', { method: 'GET' });
  },
};
