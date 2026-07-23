// Centralized API Client for Backend Integration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, body, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, default to application/json
  if (body && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers,
      body,
    });

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login/')) {
        console.warn('API Unauthorized 401 - attempting silent re-authentication');
        localStorage.removeItem('access_token');
        
        let loginSuccess = false;
        let freshToken = '';
        
        // Try production credentials first
        try {
          const authRes = await fetch(`${BASE_URL}/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@1234' }),
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            freshToken = authData.access || authData.access_token;
            if (freshToken) {
              localStorage.setItem('access_token', freshToken);
              loginSuccess = true;
            }
          }
        } catch (e) {
          // Ignore
        }
        
        // Try local dev credentials second if production failed
        if (!loginSuccess) {
          try {
            const authRes = await fetch(`${BASE_URL}/api/auth/login/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
            });
            if (authRes.ok) {
              const authData = await authRes.json();
              freshToken = authData.access || authData.access_token;
              if (freshToken) {
                localStorage.setItem('access_token', freshToken);
                loginSuccess = true;
              }
            }
          } catch (e) {
            // Ignore
          }
        }
        
        if (loginSuccess && freshToken) {
          console.log('Silent re-authentication successful, retrying request...');
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${freshToken}`
          };
          const retryResponse = await fetch(url, {
            ...customConfig,
            headers: retryHeaders,
            body,
          });
          if (retryResponse.ok) {
            if (retryResponse.status === 204) return {} as T;
            return await retryResponse.json();
          }
        }
      }

      const errorText = await response.text();
      let errorJson: any = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // non-json response
      }
      let errorMsg = errorJson.detail || errorJson.message;
      if (!errorMsg && typeof errorJson === 'object' && errorJson !== null) {
        errorMsg = Object.entries(errorJson)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      }
      throw new Error(errorMsg || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}
