import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const googleAuthUrl = (() => {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  if (normalizedBase.endsWith('/api')) {
    return `${normalizedBase}/auth/google`;
  }
  return `${normalizedBase}/api/auth/google`;
})();

const createApiInstance = (options: { skipRefresh?: boolean } = {}) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  if (!options.skipRefresh) {
    type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

    instance.interceptors.response.use(
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
            `${instance.defaults.baseURL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          const newAccessToken = refreshResponse.data?.token;
          if (newAccessToken) {
            localStorage.setItem('token', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return instance(originalRequest);
        } catch {
          const hasToken = !!localStorage.getItem('token');
          if (!hasToken) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      }
    );
  }

  return instance;
};

export const api = createApiInstance();
export const adminApi = createApiInstance({ skipRefresh: true });

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

export const createApiKey = async (data: { name: string }) => {
  try {
    const response = await api.post('/apikeys', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getApiKeys = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/apikeys', { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const revokeApiKey = async (id: string) => {
  try {
    const response = await api.patch(`/apikeys/${id}/revoke`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteApiKey = async (id: string) => {
  try {
    const response = await api.delete(`/apikeys/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};