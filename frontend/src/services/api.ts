import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const googleAuthUrl = (() => {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  if (normalizedBase.endsWith('/api')) {
    return `${normalizedBase}/auth/google`;
  }
  return `${normalizedBase}/api/auth/google`;
})();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

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

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post(
        `${api.defaults.baseURL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const newAccessToken = refreshResponse.data?.token;
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
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

export const getServicePlans = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/plans', { params: { page, limit } });
    return response.data;
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
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getClients = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/clients', { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAbortController = () => new AbortController();

export const cancelRequest = (abortController: AbortController) => {
  abortController.abort();
};