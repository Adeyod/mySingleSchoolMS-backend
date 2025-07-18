import mongoose, { Schema } from 'mongoose';
import {
  busRouteEnum,
  busTripEnum,
  paymentEnum,
  paymentStatusEnum,
} from '../constants/enum';
import { PaymentDocument } from '../constants/types';
// get the document and take out the following data:
const paymentSchema = new mongoose.Schema<PaymentDocument>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    class_level: { type: String, required: true },
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    term: { type: String, required: true },
    fees_breakdown: [
      {
        fee_name: { type: String, required: true },
        amount: { type: Number, required: true },
        receiving_account: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'SchoolAccount',
        },
      },
    ],
    is_submit_response: { type: Boolean, default: false },
    total_amount: { type: Number, required: true, default: 0 },
    is_payment_complete: { type: Boolean, default: false },
    remaining_amount: { type: Number, default: 0 },
    waiting_for_confirmation: [
      {
        amount_paid: { type: Number },
        date_paid: { type: Date, default: Date.now },
        payment_method: { type: String, enum: paymentEnum },
        message: { type: String },
        transaction_id: { type: String },
        bank_name: { type: String },
        fees_collection_breakdown: [
          {
            fee_name: { type: String, required: true },
            amount: { type: Number, required: true },
            receiving_account: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'SchoolAccount',
            },
          },
        ],
        staff_who_approve: { type: Schema.Types.ObjectId, ref: 'NonTeaching' },
        status: {
          type: String,
          enum: paymentStatusEnum,
          default: paymentStatusEnum[0],
        },
      },
    ],
    payment_summary: [
      {
        amount_paid: { type: Number },
        date_paid: { type: Date, default: Date.now },
        payment_method: { type: String, enum: paymentEnum },
        message: { type: String },
        transaction_id: { type: String },
        fees_collection_breakdown: [
          {
            fee_name: { type: String, required: true },
            amount: { type: Number, required: true },
            receiving_account: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'SchoolAccount',
            },
          },
        ],
        bank_name: { type: String },
        staff_who_approve: { type: Schema.Types.ObjectId, ref: 'NonTeaching' },
        status: {
          type: String,
          enum: paymentStatusEnum,
          default: paymentStatusEnum[0],
        },
      },
    ],
  },
  { timestamps: true }
);

const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
export default Payment;
