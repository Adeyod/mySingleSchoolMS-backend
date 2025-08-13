import mongoose, { Schema } from 'mongoose';
import { rolesEnum, teacherStatusEnum } from '../constants/enum';
import { UserDocument } from '../constants/types';

const teacherSchema = new mongoose.Schema<UserDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: rolesEnum, default: rolesEnum[2] },
    password: { type: String, required: true },
    redundant: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    is_updated: { type: Boolean, default: false },
    class_managing: { type: Schema.Types.ObjectId, ref: 'Class' },
    employment_date: { type: Date, required: true },
    status: {
      type: String,
      enum: teacherStatusEnum,
      default: teacherStatusEnum[0],
    },
    subjects_capable_of_teaching: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    teaching_assignment: [
      {
        subject: {
          type: Schema.Types.ObjectId,
          ref: 'Subject',
        },
        class_id: {
          type: Schema.Types.ObjectId,
          ref: 'Class',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

teacherSchema.index({ email: 1 });

const Teacher = mongoose.model<UserDocument>('Teacher', teacherSchema);
export default Teacher;
