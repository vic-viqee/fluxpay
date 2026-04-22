import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { formatKenyanPhoneNumber } from '../utils/phone';
import NodeCache from 'node-cache';

const tokenCache = new NodeCache({ stdTTL: 3500, checkperiod: 300 });

const darajaApi = axios.create({
  baseURL: 'https://sandbox.safaricom.co.ke',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MpesaBalance {
  availableBalance: string;
  reservedBalance: string;
  unclearedBalance: string;
}

export interface TransactionStatus {
  transactionId: string;
  transactionStatus: string;
  amount: string;
  recipient: string;
  transactionDate: string;
}

const getAuthToken = async () => {
  const cachedToken = tokenCache.get<string>('mpesa_token');
  if (cachedToken) {
    return cachedToken;
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
    
    const ttl = parseInt(response.data.expires_in, 10) - 60;
    tokenCache.set('mpesa_token', response.data.access_token, ttl);
    
    logger.info('M-Pesa auth token generated successfully');
    return response.data.access_token;
  } catch (error: any) {
    logger.error('Failed to generate M-Pesa auth token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with M-Pesa');
  }
};

const initiateStkPush = async (
  phoneNumber: string, 
  amount: number, 
  accountReference: string = 'FluxPay', 
  transactionDesc: string = 'FluxPay Payment'
) => {
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
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
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

const getAccountBalance = async (): Promise<MpesaBalance> => {
  const token = await getAuthToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${config.mpesa.shortCode}${config.mpesa.passKey}${timestamp}`).toString('base64');

  try {
    const response = await darajaApi.post<{ Result: { ConversationCode: string; Owner: string; BusinessShortCode: string; Currency: string; Balances: { AvailableBalance: string; ReservedBalance: string; UnclearedBalance: string }[] } }>('/mpesa/accountbalance/v1/query', {
      BusinessShortCode: config.mpesa.shortCode,
      Password: password,
      Timestamp: timestamp,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const balanceData = response.data.Result?.Balances?.[0];
    const result: MpesaBalance = {
      availableBalance: balanceData?.AvailableBalance || '0',
      reservedBalance: balanceData?.ReservedBalance || '0',
      unclearedBalance: balanceData?.UnclearedBalance || '0',
    };

    logger.info('Account balance queried successfully');
    return result;
  } catch (error: any) {
    logger.error('Failed to query account balance:', error.response?.data || error.message);
    throw new Error('Failed to query account balance');
  }
};

const getTransactionStatus = async (checkoutRequestId: string): Promise<TransactionStatus> => {
  const token = await getAuthToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${config.mpesa.shortCode}${config.mpesa.passKey}${timestamp}`).toString('base64');

  try {
    const response = await darajaApi.post<{ Result: { ConversationCode: string; TransactionStatus: string; RefNumber: string; Occasion: string } }>('/mpesa/stkpushquery/v1/query', {
      BusinessShortCode: config.mpesa.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const statusData = response.data.Result;
    const result: TransactionStatus = {
      transactionId: checkoutRequestId,
      transactionStatus: statusData?.TransactionStatus || 'Unknown',
      amount: '0',
      recipient: statusData?.RefNumber || '',
      transactionDate: new Date().toISOString(),
    };

    logger.info(`Transaction status queried for: ${checkoutRequestId}`);
    return result;
  } catch (error: any) {
    logger.error('Failed to query transaction status:', error.response?.data || error.message);
    throw new Error('Failed to query transaction status');
  }
};

export { getAuthToken, initiateStkPush, getAccountBalance, getTransactionStatus };
