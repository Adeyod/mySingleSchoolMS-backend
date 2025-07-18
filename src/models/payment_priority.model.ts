import mongoose from 'mongoose';
import { PaymentPriorityType } from '../constants/types';

const paymentPrioritySchema = new mongoose.Schema<PaymentPriorityType>(
  {
    priority_order: [
      {
        fee_name: { type: String, required: true },
        priority_number: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const PaymentPriority = mongoose.model<PaymentPriorityType>(
  'PaymentPriority',
  paymentPrioritySchema
);
export default PaymentPriority;
