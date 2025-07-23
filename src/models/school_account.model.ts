import mongoose from 'mongoose';
import { SchoolAccountType } from '../constants/types';

const schoolAccountSchema = new mongoose.Schema<SchoolAccountType>(
  {
    accounts: [
      {
        account_number: { type: String, required: true },
        bank_name: { type: String, required: true },
        account_name: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const SchoolAccount = mongoose.model<SchoolAccountType>(
  'SchoolAccount',
  schoolAccountSchema
);
export default SchoolAccount;
