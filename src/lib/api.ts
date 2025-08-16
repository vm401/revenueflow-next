import axios, { type AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tech-staked-crm-backend.onrender.com';

// Create axios instance with enhanced configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor for auth and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('🚨 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('🚨 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Clear auth token on 401
      localStorage.removeItem('auth_token');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/signin')) {
        window.location.href = '/signin';
      }
    }

    // Transform error for better handling
    const enhancedError = {
      ...error,
      isNetworkError: !error.response,
      isServerError: error.response?.status >= 500,
      isClientError: error.response?.status >= 400 && error.response?.status < 500,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred'
    };

    return Promise.reject(enhancedError);
  }
);

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface CampaignData {
  id: number;
  campaign_name: string;
  app_name: string;
  country: string;
  spend: number;
  installs: number;
  actions: number;
  date: string;
  cpi: number;
  ctr?: number;
  cvr?: number;
}

export interface DashboardSummary {
  total_campaigns: number;
  total_spend: number;
  total_installs: number;
  total_actions: number;
  average_cpi: number;
}

// API endpoints
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  HEALTH_DETAILED: '/health/detailed',
  
  // Dashboard
  DASHBOARD_DATA: '/analytics/dashboard',
  
  // Campaigns
  CAMPAIGNS: '/campaigns',
  
  // Upload
  UPLOAD_CSV: '/upload/csv',
  UPLOAD_MULTIPLE_CSV: '/upload/csv/multiple',
  UPLOAD_STATUS: '/upload/status',
  UPLOAD_CLEAR: '/upload/clear',
  
  // Analytics
  PERFORMANCE_DATA: '/analytics/performance',
  
  // Filters
  AVAILABLE_COUNTRIES: '/filters/countries',
  AVAILABLE_APPS: '/filters/apps',
  AVAILABLE_DATES: '/filters/dates',
  
  // Creatives
  CREATIVES: '/creatives',
  CREATIVE_UPLOAD: '/creatives/upload',
  CREATIVE_MATCH: '/creatives/match',
  CREATIVE_EXPORT: '/creatives/export',
  
  // Apps, Exchanges, Inventory
  APPS: '/apps',
  EXCHANGES: '/exchanges',
  INVENTORY: '/inventory',
  
  // Auth (future)
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
};

// API functions
export const api = {
  // Health check
  health: () => apiClient.get(API_ENDPOINTS.HEALTH),
  healthDetailed: () => apiClient.get(API_ENDPOINTS.HEALTH_DETAILED),
  
  // Dashboard
  getDashboardData: (): Promise<AxiosResponse<APIResponse<{
    summary: DashboardSummary;
    daily_performance: any[];
    top_apps: any[];
    country_performance: any[];
  }>>> => apiClient.get(API_ENDPOINTS.DASHBOARD_DATA),
  
  // Campaigns
  getCampaigns: (params?: any): Promise<AxiosResponse<APIResponse<CampaignData[]>>> => 
    apiClient.get(API_ENDPOINTS.CAMPAIGNS, { params }),
  
  // Upload
  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(API_ENDPOINTS.UPLOAD_CSV, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadMultipleCSV: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return apiClient.post(API_ENDPOINTS.UPLOAD_MULTIPLE_CSV, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  clearUploadedData: () => apiClient.delete(API_ENDPOINTS.UPLOAD_CLEAR),
  
  // Filters
  getAvailableCountries: () => apiClient.get(API_ENDPOINTS.AVAILABLE_COUNTRIES),
  getAvailableApps: () => apiClient.get(API_ENDPOINTS.AVAILABLE_APPS),
  getAvailableDates: () => apiClient.get(API_ENDPOINTS.AVAILABLE_DATES),
  
  // Creatives
  getCreatives: (params?: any) => apiClient.get(API_ENDPOINTS.CREATIVES, { params }),
  
  // Apps, Exchanges, Inventory
  getApps: () => apiClient.get(API_ENDPOINTS.APPS),
  getExchanges: () => apiClient.get(API_ENDPOINTS.EXCHANGES),
  getInventory: () => apiClient.get(API_ENDPOINTS.INVENTORY),
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth-token');
      window.location.href = '/signin';
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
