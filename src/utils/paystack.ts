import axios from 'axios';
import crypto from 'crypto';
import { paymentEnum } from '../constants/enum';
import { AppError } from './app.error';
import {
  PaystackPayloadType,
  PaystackSchoolPaymentType,
} from '../constants/types';
import { Request, Response } from 'express';
import Payment from '../models/payment.model';
import {
  calculateAndUpdateStudentPaymentDocuments,
  commonPaystackFunction,
} from '../repository/payment.repository';

const secret = process.env.PAYSTACK_TEST_SECRET_KEY || '';

const paystackInitialization = async (payload: PaystackSchoolPaymentType) => {
  try {
    const formattedAmount = payload.amount * 100;
    // const formattedAmount =
    //   parseInt(payload.amount.replace(/,/g, ''), 10) * 100;

    const paystackData = {
      email: payload.student_email,
      amount: formattedAmount,
      metadata: payload,
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const parsedData = JSON.parse(response.config.data);

    const amt = parseFloat(
      parsedData.metadata.amount.toString().replace(/,/g, '')
    );

    if (isNaN(amt)) {
      throw new AppError(
        'Invalid amount provided. please provide a valid number.',
        400
      );
    }
    const data = {
      status: response.data.status,
      date_paid: new Date(),
      payment_method: paymentEnum[2],
      message: response.data.message,
      transaction_id: response.data.data.reference,
      amount_paid: amt,
    };

    const obj = { response, data };

    return obj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

const paystackCallBack = async (payload: PaystackPayloadType) => {
  try {
    const headers = {
      Authorization: `Bearer ${secret}`,
    };

    const url = `https://api.paystack.co/transaction/verify/${payload.reference}`;

    const paystackResponse = await axios(url, { headers });
    // console.log('paystackResponse: ', paystackResponse);
    if (paystackResponse.data.data.status === 'success') {
      // const response = await Payment.findOne({
      //   student: payload.student_id,
      // });

      // if (!response) {
      //   throw new AppError('Payment document not found.', 404);
      // }

      // const studentPaymentDoc = response.waiting_for_confirmation.find((p) => {
      //   p.transaction_id === payload.reference;
      // });

      // if (studentPaymentDoc) {
      //   // CALL THE FUNCTION THAT PROCESSES CASH PAYMENT
      //   if (
      //     !studentPaymentDoc ||
      //     !studentPaymentDoc.amount_paid ||
      //     !studentPaymentDoc.transaction_id ||
      //     !studentPaymentDoc.payment_method
      //   ) {
      //     throw new AppError('document not found.', 400);
      //   }

      //   const payload2 = {
      //     student_id: response.student.toString(),
      //     session_id: response.session.toString(),
      //     term: response.term,
      //     amount_paying: studentPaymentDoc?.amount_paid,
      //     teller_number: studentPaymentDoc?.transaction_id,
      //     payment_method: studentPaymentDoc?.payment_method,
      //   };
      //   const result = await calculateAndUpdateStudentPaymentDocuments(
      //     payload2, 'card'
      //   );
      //   return result;
      // } else {
      //   // THIS MEANS THAT WEBHOOK HAS DONE THE PROCESSING
      //   const getFromPaymentSummary = response.payment_summary.find((p) => {
      //     p.transaction_id = payload.reference;
      //   });

      //   return getFromPaymentSummary;
      // }

      const response = await commonPaystackFunction(payload, 'card');

      return response;
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const paystackWebHook = async (req: Request, res: Response) => {
  try {
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
      const event = req.body;

      // console.log('event:', event);

      if (event.event === 'charge.success') {
        const {
          reference,
          status,
          created_at,
          metadata: {
            student_id,
            student_email,
            amount,
            session_id,
            term,
            payment_document_id,
          },
          authorization: { bank, account_name },
        } = event.data;
        const amt = parseFloat(amount);
        // console.log('event.data:', event.data);

        if (isNaN(amt)) {
          throw new AppError('Invalid amount provided', 400);
        }

        const payload = {
          student_id,
          reference: event.data.reference,
        };

        const response = await commonPaystackFunction(payload, 'card');
        // console.log('response:', response);
        return response;
      }
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export { paystackInitialization, paystackCallBack, paystackWebHook };
