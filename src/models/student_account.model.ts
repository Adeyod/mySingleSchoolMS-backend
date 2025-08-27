import mongoose from 'mongoose';
import { StudentAccountDocumentType } from '../constants/types';

const studentAccountSchema = new mongoose.Schema<StudentAccountDocumentType>(
  {
    account_name: { type: String },
    customer_reference: { type: String },
    our_ref_to_bank: { type: String, required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    account_number: { type: String },
    account_balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StudentAccount = mongoose.model<StudentAccountDocumentType>(
  'StudentAccount',
  studentAccountSchema
);
export default StudentAccount;
