import mongoose from 'mongoose';
import { teacherStatusEnum, genderEnum, rolesEnum } from '../constants/enum';
import { UserDocument } from '../constants/types';

const adminSchema = new mongoose.Schema<UserDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String },
    gender: { type: String, enum: genderEnum, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    employment_date: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: rolesEnum, default: rolesEnum[0] },
    is_verified: { type: Boolean, default: false },
    redundant: { type: Boolean, default: false },
    status: {
      type: String,
      enum: teacherStatusEnum,
      default: teacherStatusEnum[0],
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.index({ email: 1 });
const Admin = mongoose.model<UserDocument>('Admin', adminSchema);
export default Admin;
