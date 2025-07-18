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
    stream: {
      type: String,
      enum: streamEnum,
      required: false,
    }, // Only for SSS

    sections: {
      type: [
        {
          tier: { type: String, enum: subjectTierEnum, required: true },
          is_compulsory: { type: Boolean, required: true },
        },
      ],
      required: true,
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
