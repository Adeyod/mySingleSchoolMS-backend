import mongoose, { Model, Schema } from 'mongoose';
import { termEnum, finalResultStatusEnum } from '../constants/enum';
import { ResultDocument } from '../constants/types';

const resultSchema = new mongoose.Schema<ResultDocument>(
  {
    enrolment: {
      type: Schema.Types.ObjectId,
      ref: 'ClassEnrolment',
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    class_teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    academic_session_id: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },

    term_results: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId },
        term: {
          type: String,
          required: true,
          enum: termEnum,
        },
        cumulative_score: { type: Number, default: 0 },
        class_position: { type: String },
        subject_results: [
          {
            subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
            subject_teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
            total_score: { type: Number },
            first_test_score: { type: Number, default: null }, // e.g., out of 20
            second_test_score: { type: Number, default: null },
            exam_score: { type: Number, default: null },
            grade: { type: String },
            subject_position: { type: String },
          },
        ],
      },
    ],

    final_cumulative_score: {
      type: Number,
      default: 0,
    },
    final_status: {
      type: String,
      enum: finalResultStatusEnum,
      default: null,
    },
    position: { type: Number },
  },
  { timestamps: true }
);

const Result: Model<ResultDocument> = mongoose.model<ResultDocument>(
  'Result',
  resultSchema
);
export default Result;
