import mongoose, { Schema } from 'mongoose';
import { UserDocument } from '../constants/types';
import { rolesEnum } from '../constants/enum';

const parentSchema = new mongoose.Schema<UserDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    redundant: { type: Boolean, default: false },
    role: { type: String, enum: rolesEnum, default: rolesEnum[3] },
    is_verified: { type: Boolean, default: false },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
);

parentSchema.index({ emai: 1 });
const Parent = mongoose.model<UserDocument>('Parent', parentSchema);

export default Parent;
