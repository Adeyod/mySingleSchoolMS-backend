import mongoose from 'mongoose';
import { termEnum } from '../constants/enum';
import { ClassCbtAssessmentTimetableDocument } from '../constants/types';

const subjectScheduleSchema = new mongoose.Schema({
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  authorized_students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Students',
      _id: false,
    },
  ],
  students_that_have_started: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Students',
      _id: false,
    },
  ],
  students_that_have_submitted: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Students',
      _id: false,
    },
  ],
  exam_subject_status: {
    type: String,
    enum: ['not_started', 'ongoing', 'ended', 'late_to_start'],
    default: 'not_started',
  },
  start_time: { type: Date, required: true },
  duration: { type: Number, required: true },
  theory_start_time: { type: Date },
  theory_duration: { type: Number },
  is_subject_question_set: { type: Boolean, default: false },
  has_subject_grace_period_ended: { type: Boolean, default: false },
});

const classExamTimetableSchema =
  new mongoose.Schema<ClassCbtAssessmentTimetableDocument>(
    {
      assessment_type: { type: String, required: true },
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
      term: { type: String, enum: termEnum, required: true },
      scheduled_subjects: [subjectScheduleSchema],
    },
    {
      timestamps: true,
    }
  );

const ClassExamTimetable = mongoose.model<ClassCbtAssessmentTimetableDocument>(
  'ClassExamTimetable',
  classExamTimetableSchema
);
export default ClassExamTimetable;
