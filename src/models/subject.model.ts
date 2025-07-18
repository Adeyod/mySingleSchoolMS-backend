import mongoose, { Schema } from 'mongoose';
import {
  streamEnum,
  subjectTierEnum,
  subjectTypeEnum,
} from '../constants/enum';
import { required } from 'joi';

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String },
    description: {
      type: String,
    },
    class_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    teacher_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
