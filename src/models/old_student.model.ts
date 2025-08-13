import mongoose, { Schema } from 'mongoose';
import { UserDocument } from '../constants/types';
import { rolesEnum } from '../constants/enum';

const oldStudentStatus = ['active', 'inactive'];

const oldStudentSchema = new mongoose.Schema<UserDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String },
    gender: { type: String, required: true },
    phone: { type: String },
    dob: { type: Date },
    home_address: { type: String },
    admission_number: { type: String, unique: true },

    admission_session: { type: String },
    alumni_status: {
      type: String,
      enum: oldStudentStatus,
      default: oldStudentStatus[0],
    },
    employment_details: {
      company_name: { type: String },
      position: { type: String },
    },
    email: { type: String, required: true },
    password: { type: String, required: true },
    graduation_session: { type: String },
    is_verified: { type: Boolean, default: false },
    parent_id: [{ type: Schema.Types.ObjectId, ref: 'Parent' }],
    role: { type: String, enum: rolesEnum, default: rolesEnum[5] },
    outstanding_balance: { type: Number, default: 0 },
    profile_image: {
      url: { type: String },
      public_url: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

oldStudentSchema.index({ email: 1 });
const OldStudent = mongoose.model<UserDocument>('OldStudent', oldStudentSchema);
export default OldStudent;
