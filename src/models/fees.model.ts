import mongoose, { Schema } from 'mongoose';
import { SchoolFeesDocument } from '../constants/types';

const feesSchema = new mongoose.Schema<SchoolFeesDocument>(
  {
    level: { type: String, required: true },
    academic_session_id: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    term: { type: String, required: true },

    optional_fees: [
      {
        fee_name: { type: String },
        amount: { type: Number },
        applicable_classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
        receiving_account: {
          type: Schema.Types.ObjectId,
          ref: 'SchoolAccount',
          required: true,
        },
      },
    ],
    mandatory_fees: [
      {
        fee_name: { type: String },
        amount: { type: Number },
        receiving_account: {
          type: Schema.Types.ObjectId,
          ref: 'SchoolAccount',
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Fee = mongoose.model<SchoolFeesDocument>('Fee', feesSchema);

export default Fee;
