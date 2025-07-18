// import dotenv from 'dotenv'
// dotenv.config()

import axios from 'axios';
import { AppError } from './app.error';
import { CustomerCreationPayloadType } from '../constants/types';

const secret = process.env.PAYSTACK_TEST_SECRET_KEY || '';

// THIS WILL CREATE CUSTOMER DOCUMENT FOR EACH STUDENT WHEN THIS
// ENDPOINT IS USED. THEN THE CUSTOMER NUMBER IS NEEDED FOR THE
// VIRTUAL ACCOUNT OPENING. WE ALSO NEED TO STORE THE RESPONSE
// INSIDE THE STUDENT DOCUMENT BECAUSE IT WILL BE NEEDED LATER.
const createCustomerPaystackAccount = async (
  payload: CustomerCreationPayloadType
) => {
  const {
    student_email,
    student_first_name,
    student_last_name,
    student_school_name,
    student_id,
  } = payload;
  const paystackParam = JSON.stringify({
    email: student_email,
    first_name: student_first_name,
    last_name: student_last_name,
    metadata: {
      school_name: student_school_name,
      student_id: student_id,
    },
  });
  try {
    console.log('secret:', secret);

    const response = await axios.post(
      'https://api.paystack.co/customer',
      paystackParam,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('response:', response);
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// THIS IS THE FUNCTION THAT WILL CREATE THE DEDICATED VIRTUAL
// ACCOUNT FOR EACH STUDENT. WEMA BANK WILL BE USED
const openDedicatedVirtualAccount = async (student_paystack_id: string) => {
  try {
    const data = {
      customer: student_paystack_id,
      preferred_bank: 'wema-bank',
    };

    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      data,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('response:', response);
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something went wrong');
    }
  }
};

export { createCustomerPaystackAccount, openDedicatedVirtualAccount };
