import { Schema, model, Types, Document } from 'mongoose';
import { SubjectResultDocument } from '../constants/types';
import { termEnum } from '../constants/enum';

const subjectResultSchema = new Schema<SubjectResultDocument>(
  {
    enrolment: {
      type: Schema.Types.ObjectId,
      ref: 'ClassEnrolment',
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    subject_teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    term_results: [
      {
        term: {
          type: String,
          required: true,
          enum: termEnum,
        },
        total_score: { type: Number },
        last_term_cumulative: { type: Number },
        cumulative_average: { type: Number },
        exam_object: [
          {
            key: { type: String, trim: true },
            score_name: { type: String },
            score: { type: Number, default: null },
          },
        ],
        scores: [
          {
            key: { type: String, trim: true },
            score_name: { type: String },
            score: { type: Number, default: null },
          },
        ],
        grade: { type: String },
        remark: { type: String },
        subject_position: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const SubjectResult = model<SubjectResultDocument>(
  'SubjectResult',
  subjectResultSchema
);
