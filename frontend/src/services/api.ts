import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

export const initiateStkPushPayment = async (data: {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDescription?: string;
}) => {
  try {
    const response = await api.post('/payments/stk-push', data);
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
    return response.data.plans; // Assuming the backend returns { plans: [...] }
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
    return response.data.client; // Assuming the backend returns { client: {...} }
  } catch (error) {
    throw error;
  }
};
