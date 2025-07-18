import mongoose from 'mongoose';
import { examStatusEnum, triggerTypeEnum } from '../constants/enum';
import { CbtResultDocument } from '../constants/types';

const cbtResultSchema = new mongoose.Schema<CbtResultDocument>(
  {
    subject_teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },

    academic_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },

    exam_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CbtExam',
      required: true,
    },

    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },

    enrolment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassEnrolment',
      required: true,
    },

    shuffled_obj_questions: [
      {
        question_shuffled_number: { type: Number },
        question_original_number: { type: Number },
        question_text: { type: String },
        options: [String],
        score: { type: Number },
        selected_answer: { type: String },
        correct_answer: { type: String },
        student_score: { type: Number, default: 0 },
      },
    ],

    shuffled_theory_questions: [
      {
        question_number: { type: Number },
        question_text: { type: String },
        score: { type: Number },
        student_score: { type: Number },
        selected_answer: { type: String },
      },
    ],
    obj_trigger_type: { type: String, enum: triggerTypeEnum },
    level: { type: String, required: true },

    obj_start_time: { type: Date, required: true },
    obj_total_time_allocated: { type: Number },
    obj_final_cutoff_time: { type: Date, required: true },
    obj_time_left: { type: Number },
    obj_started_at: { type: Date },
    obj_submitted_at: { type: Date },

    objective_total_score: { type: Number },
    theory_total_score: { type: Number },
    total_score: { type: Number },
    percent_score: { type: Number },
    obj_status: {
      type: String,
      enum: examStatusEnum,
      default: examStatusEnum[0],
    },
    theory_status: {
      type: String,
      enum: examStatusEnum,
      default: examStatusEnum[0],
    },
    term: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CbtResult = mongoose.model<CbtResultDocument>(
  'CbtResult',
  cbtResultSchema
);
export default CbtResult;
