import mongoose from 'mongoose';
import { termEnum } from '../constants/enum';
import { CbtQuestionDocument } from '../constants/types';

const cbtQuestionSchema = new mongoose.Schema<CbtQuestionDocument>(
  {
    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CbtExam',
      required: true,
    },
    academic_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    allowed_students: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    ],
    obj_questions: [
      {
        question_number: { type: Number, required: true },
        question_text: { type: String, required: true },
        options: { type: [String], required: true },
        correct_answer: { type: String, required: true },
        score: { type: Number, default: 1 },
      },
    ],
    obj_start_time: { type: Date, required: true },
    obj_initial_cutoff_time: { type: Date, required: true },
    obj_final_cutoff_time: { type: Date, required: true },
    obj_total_time_allocated: { type: Number, required: true },
    theory_start_time: { type: Date },
    theory_initial_cutoff_time: { type: Date },
    theory_final_cutoff_time: { type: Date },
    theory_total_time_allocated: { type: Number },

    theory_questions: [
      {
        question_number: { type: Number, required: true },
        question_text: { type: String, required: true },
        score: { type: Number, required: true },
      },
    ],
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    term: { type: String, enum: termEnum, required: true },
    level: { type: String, required: true },
    exam_subject_status: {
      type: String,
      enum: ['not_started', 'ongoing', 'late_to_start', 'ended'],
      default: 'not_started',
    },
  },
  {
    timestamps: true,
  }
);

const CbtQuestion = mongoose.model<CbtQuestionDocument>(
  'CbtQuestion',
  cbtQuestionSchema
);
export default CbtQuestion;
