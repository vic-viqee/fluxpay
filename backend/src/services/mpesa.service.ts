import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { formatKenyanPhoneNumber } from '../utils/phone';

const darajaApi = axios.create({
  baseURL: 'https://sandbox.safaricom.co.ke', // Use sandbox for development
  headers: {
    'Content-Type': 'application/json',
  },
});

let token: {
  access_token: string;
  expires_in: string;
} | null = null;

const getAuthToken = async () => {
  if (token && new Date().getTime() < new Date().getTime() + parseInt(token.expires_in) * 1000) {
    return token.access_token;
  }

  const credentials = Buffer.from(
    `${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`
  ).toString('base64');

  try {
    const response = await darajaApi.get<{ access_token: string; expires_in: string; }>('/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    token = response.data;
    logger.info('M-Pesa auth token generated successfully');
    return token?.access_token;
  } catch (error: any) {
    logger.error('Failed to generate M-Pesa auth token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with M-Pesa');
  }
};

const initiateStkPush = async (phoneNumber: string, amount: number, businessName: string = 'FluxPay') => {
  const token = await getAuthToken();
  const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${config.mpesa.shortCode}${config.mpesa.passKey}${timestamp}`).toString('base64');

  try {
    const response = await darajaApi.post('/mpesa/stkpush/v1/processrequest', {
      BusinessShortCode: config.mpesa.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: config.mpesa.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: config.mpesa.callbackUrl,
      AccountReference: `${businessName} Subscription`, // Customize account reference
      TransactionDesc: `Payment for ${businessName}`, // Customize transaction description
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    logger.info('STK push initiated successfully');
    return response.data;
  } catch (error: any) {
    logger.error('Failed to initiate STK push:', error.response?.data || error.message);
    throw new Error('Failed to initiate STK push');
  }
};

export { getAuthToken, initiateStkPush };
