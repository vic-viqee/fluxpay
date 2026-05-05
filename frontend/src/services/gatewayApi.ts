import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const gatewayApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

gatewayApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

gatewayApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/gateway/login';
    }
    return Promise.reject(error);
  }
);

export const gatewayAuth = {
  signup: async (data: {
    email: string;
    password: string;
    businessName: string;
    businessPhoneNumber: string;
    businessTillOrPaybill?: string;
    businessType?: string;
  }) => {
    const response = await gatewayApi.post('/gateway-auth/signup', data);
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await gatewayApi.post('/gateway-auth/login', { email, password });
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await gatewayApi.post('/gateway-auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await gatewayApi.post(`/gateway-auth/reset-password/${token}`, { password });
    return response.data;
  }
};

export const gatewayDashboard = {
  getStats: async () => {
    const response = await gatewayApi.get('/gateway/dashboard');
    return response.data;
  }
};

export const gatewayTransactions = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; search?: string; startDate?: string; endDate?: string }) => {
    const response = await gatewayApi.get('/gateway/transactions', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await gatewayApi.get(`/gateway/transactions/${id}`);
    return response.data;
  },
  initiate: async (data: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc?: string;
    customerName?: string;
    customerEmail?: string;
  }) => {
    const response = await gatewayApi.post('/gateway/initiate', data);
    return response.data;
  }
};

export const gatewayPaymentLinks = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await gatewayApi.get('/gateway/payment-links', { params });
    return response.data;
  },
  create: async (data: {
    title: string;
    description?: string;
    amount: number;
    expiresAt?: string;
    maxUses?: number;
    customerPhone?: string;
    customerEmail?: string;
    redirectUrl?: string;
    webhookUrl?: string;
  }) => {
    const response = await gatewayApi.post('/gateway/payment-links', data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await gatewayApi.delete(`/gateway/payment-links/${id}`);
    return response.data;
  }
};

export const gatewayCustomers = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await gatewayApi.get('/gateway/customers', { params });
    return response.data;
  },
  create: async (data: {
    name: string;
    email?: string;
    phoneNumber: string;
    notes?: string;
    tags?: string[];
  }) => {
    const response = await gatewayApi.post('/gateway/customers', data);
    return response.data;
  },
  update: async (id: string, data: {
    name?: string;
    email?: string;
    notes?: string;
    tags?: string[];
  }) => {
    const response = await gatewayApi.put(`/gateway/customers/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await gatewayApi.delete(`/gateway/customers/${id}`);
    return response.data;
  }
};

export const mpesa = {
  checkStatus: async (checkoutRequestId: string) => {
    const response = await axios.get(`${API_BASE_URL}/mpesa/status/${checkoutRequestId}`);
    return response.data.data;
  },
  checkBalance: async () => {
    const response = await axios.get(`${API_BASE_URL}/mpesa/balance`);
    return response.data.data;
  }
};

export const c2b = {
  register: async (confirmationUrl: string) => {
    const response = await gatewayApi.post('/gateway/c2b/register', { confirmationUrl });
    return response.data;
  },
  getTransactions: async (params?: { page?: number; limit?: number; reconciled?: boolean; startDate?: string; endDate?: string }) => {
    const response = await gatewayApi.get('/gateway/c2b/transactions', { params });
    return response.data;
  },
  reconcile: async (id: string) => {
    const response = await gatewayApi.post(`/gateway/c2b/transactions/${id}/reconcile`);
    return response.data;
  }
};

export const reversal = {
  initiate: async (data: { transactionId: string; reason: string }) => {
    const response = await gatewayApi.post('/gateway/reversal', data);
    return response.data;
  },
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await gatewayApi.get('/gateway/reversal', { params });
    return response.data;
  }
};

export default gatewayApi;
