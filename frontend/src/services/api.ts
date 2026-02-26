import axios, { InternalAxiosRequestConfig } from 'axios';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getStoredAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const storeAuthTokens = (token: string, refreshToken?: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const googleAuthUrl = (() => {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  if (normalizedBase.endsWith('/api')) {
    return `${normalizedBase}/auth/google`;
  }
  return `${normalizedBase}/api/auth/google`;
})();

api.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableConfig;
    const status = error.response?.status;
    const requestUrl = String(originalRequest?.url || '');

    const shouldSkipRefresh =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/google/exchange-code');

    if (status !== 401 || !originalRequest || originalRequest._retry || shouldSkipRefresh) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearStoredAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
        refreshToken,
      });
      const newAccessToken = refreshResponse.data?.token;
      const newRefreshToken = refreshResponse.data?.refreshToken;
      if (!newAccessToken) {
        throw new Error('Missing access token in refresh response.');
      }

      storeAuthTokens(newAccessToken, newRefreshToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearStoredAuth();
      return Promise.reject(refreshError);
    }
  }
);

export default api;

export const initiateSimulatedStkPushPayment = async (data: {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDescription?: string;
}) => {
  try {
    const response = await api.post('/payments/simulate-stk-push', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Backward-compatible alias for older imports.
export const initiateStkPushPayment = initiateSimulatedStkPushPayment;

export const initiatePricingStkPushPayment = async (data: {
  phoneNumber: string;
  plan: 'Starter' | 'Growth';
}) => {
  try {
    const response = await api.post('/payments/pricing-stk-push', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createServicePlan = async (planData: {
  name: string;
  amountKes: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
  billingDay: number;
}) => {
  try {
    const response = await api.post('/plans', planData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getServicePlans = async () => {
  try {
    const response = await api.get('/plans');
    return response.data.plans;
  } catch (error) {
    throw error;
  }
};

export const updateServicePlan = async (
  id: string,
  planData: {
    name: string;
    amountKes: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
    billingDay: number;
  }
) => {
  try {
    const response = await api.put(`/plans/${id}`, planData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteServicePlan = async (id: string) => {
  try {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createClient = async (clientData: {
  name: string;
  phoneNumber: string;
  email?: string;
}) => {
  try {
    const response = await api.post('/clients', clientData);
    return response.data.client;
  } catch (error) {
    throw error;
  }
};

export const getClients = async () => {
  try {
    const response = await api.get('/clients');
    return response.data?.clients || [];
  } catch (error) {
    throw error;
  }
};
