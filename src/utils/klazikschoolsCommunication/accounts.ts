import crypto from 'crypto';
import axios from 'axios';
import {
  AccountCreationReturnType,
  CreateVirtualAccountType,
} from '../../constants/types';

const klazikUrl = 'http://localhost:2500';

const CLIENT_ID = process.env.KLAZIK_CLIENT_ID as string;
const CLIENT_SECRET = process.env.KLAZIK_CLIENT_SECRET as string;
const API_KEY = process.env.KLAZIK_API_KEY as string;

if (!CLIENT_SECRET || !CLIENT_ID || !API_KEY) {
  throw new Error('Missing required environment variables for authentication');
}

function canonicalize(obj: Record<string, any>) {
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {} as Record<string, any>)
  );
}

const createVirtualAccount = async (
  payload: CreateVirtualAccountType
): Promise<AccountCreationReturnType> => {
  const timestamp = Date.now().toString();

  const payloadObj = {
    studentId: payload.student_id,
    firstName: payload.first_name,
    lastName: payload.last_name,
    accountName: payload.account_name,
    studentEmail: payload.email,
    ref_from_third_party: payload.ref,
    schoolName: payload.school_name,
    domainName: payload.domain_name,
  };

  const canonicalPayload = canonicalize(payloadObj);

  const dataToSign = `${canonicalPayload}.${timestamp}`;

  const signature = crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(dataToSign)
    .digest('hex');

  try {
    const response = await axios.post(
      `${klazikUrl}/api/v1/tp-school/accounts/open-student-account`,
      {
        timestamp,
        ...payloadObj,
      },

      {
        headers: {
          'x-client-id': CLIENT_ID,
          'x-signature': signature,
          'x-api-key': API_KEY,
          'x-timestamp': timestamp,
        },
      }
    );

    // console.log('Response from klazik schools:', response.data);
    return response.data.school;
  } catch (error: any) {
    console.error(
      'Create virtual account failed:',
      error.response?.data || error.message
    );
    throw new Error('Unable to create account number for the student.');
  }
};

const klazikProcessSchoolPayment = async () => {
  try {
  } catch (error) {
    throw new Error('Unable to create account number for the student.');
  }
};

const klazikWebhookProcessing = async () => {
  try {
  } catch (error) {
    throw new Error('Unable to create account number for the student.');
  }
};

export { createVirtualAccount };
