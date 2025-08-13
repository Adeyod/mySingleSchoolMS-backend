import mongoose, { Schema } from 'mongoose';
import { rolesEnum, teacherStatusEnum } from '../constants/enum';
import { UserDocument } from '../constants/types';

const nonTeachingSchema = new mongoose.Schema<UserDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    employment_date: { type: Date, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: rolesEnum, default: rolesEnum[6] },
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

nonTeachingSchema.index({ email: 1 });

const NonTeaching = mongoose.model<UserDocument>(
  'NonTeaching',
  nonTeachingSchema
);
export default NonTeaching;
