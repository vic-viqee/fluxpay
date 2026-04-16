import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { formatKenyanPhoneNumber } from '../utils/phone';
import { getAuthToken } from './mpesa.service';

export interface DisbursementRequest {
  phoneNumber: string;
  amount: number;
  reference: string;
  remarks?: string;
}

export interface DisbursementResult {
  conversationId: string;
  originatorConversationId: string;
  responseCode: string;
  responseText: string;
}

const initiateB2CDisbursement = async (
  phoneNumber: string,
  amount: number,
  reference: string,
  remarks?: string
): Promise<DisbursementResult> => {
  const token = await getAuthToken();
  const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${config.mpesa.shortCode}${config.mpesa.passKey}${timestamp}`).toString('base64');

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/simulate',
      {
        InitiatorCommonName: config.mpesa.initiatorName,
        SecurityCredential: password,
        CommandID: 'BusinessPayment',
        Amount: amount,
        PartyA: config.mpesa.shortCode,
        PartyB: formattedPhone,
        Remarks: remarks || `Disbursement for ${reference}`,
        QueueTimeOutURL: `${config.mpesa.callbackUrl}/b2c/timeout`,
        ResultURL: `${config.mpesa.callbackUrl}/b2c/result`,
        Occasion: reference,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data as any;
    logger.info(`B2C disbursement initiated: ${reference}`);
    return {
      conversationId: data.ConversationID || '',
      originatorConversationId: data.OriginatorConversationID || '',
      responseCode: data.ResponseCode || '0',
      responseText: data.ResponseDesc || 'Success',
    };
  } catch (error: any) {
    logger.error('Failed to initiate B2C disbursement:', error.response?.data || error.message);
    throw new Error('Failed to initiate B2C disbursement');
  }
};

export { initiateB2CDisbursement };