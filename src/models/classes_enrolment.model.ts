import mongoose, { Schema } from 'mongoose';
import {
  attendanceEnum,
  enrolmentEnum,
  streamEnum,
  termEnum,
  testTypeEnum,
} from '../constants/enum';
import { ClassEnrolmentDocument } from '../constants/types';

const classEnrolmentSchema = new mongoose.Schema<ClassEnrolmentDocument>(
  {
    students: [
      {
        student: {
          type: Schema.Types.ObjectId,
          ref: 'Student',
          required: true,
        },
        term: {
          type: String,
          // required: true,
          enum: termEnum,
        },
        subjects_offered: [
          { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        ],
      },
    ],
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    level: { type: String }, // Level (JSS 1, JSS 2, etc)
    is_active: { type: Boolean, default: false },
    academic_session_id: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    stream: {
      type: String,
      enum: streamEnum,
      required: false,
    }, // For SSS
    all_subjects_offered_in_the_class: [
      { type: Schema.Types.ObjectId, ref: 'Subject' },
    ],

    status: {
      type: String,
      required: true,
      enum: enrolmentEnum,
    },
  },
  {
    timestamps: true,
  }
);

const ClassEnrolment = mongoose.model('ClassEnrolment', classEnrolmentSchema);

export default ClassEnrolment;
