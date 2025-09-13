import { Schema, model } from 'mongoose';
import { TransactionDocument } from '../constants/types';
import {
  partyRoleEnum,
  transactionChannelEnum,
  transactionStatusEnum,
  transactionTypeEnum,
} from '../constants/enum';

const transactionSchema = new Schema<TransactionDocument>(
  {
    account: {
      type: String,
      required: true,
    },
    student: { type: String, required: true },
    type: { type: String, enum: transactionTypeEnum, required: true },
    amount: { type: Number, required: true },
    narration: { type: String },
    status: {
      type: String,
      enum: transactionStatusEnum,
      // default: transactionStatusEnum[1],
    },
    payment_reference: { type: String },
    party: {
      name: { type: String },
      account_number: { type: String },
      role: { type: String, enum: partyRoleEnum },
    },
    balance_after: { type: Number, required: true },
    channel: {
      type: String,
      enum: transactionChannelEnum,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model<TransactionDocument>(
  'Transaction',
  transactionSchema
);
