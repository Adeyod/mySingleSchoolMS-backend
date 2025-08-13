import mongoose from 'mongoose';
import { teacherStatusEnum, genderEnum, rolesEnum } from '../constants/enum';
import { UserDocument } from '../constants/types';

const superAdminSchema = new mongoose.Schema<UserDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String },
    gender: { type: String, enum: genderEnum, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: rolesEnum, default: rolesEnum[4] },
    is_verified: { type: Boolean, default: false },
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

superAdminSchema.index({ email: 1 });
const SuperAdmin = mongoose.model<UserDocument>('SuperAdmin', superAdminSchema);
export default SuperAdmin;
