import mongoose, { Schema } from 'mongoose';
import {
  streamEnum,
  subjectTierEnum,
  subjectTypeEnum,
} from '../constants/enum';
import { required } from 'joi';
import { SubjectDocument } from '../constants/types';

const subjectSchema = new mongoose.Schema<SubjectDocument>(
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

const Subject = mongoose.model<SubjectDocument>('Subject', subjectSchema);
export default Subject;
