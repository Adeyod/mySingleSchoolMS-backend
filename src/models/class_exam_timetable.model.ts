import mongoose from 'mongoose';
import { termEnum } from '../constants/enum';
import { ClassExamTimetableDocument } from '../constants/types';

const subjectScheduleSchema = new mongoose.Schema({
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  // subject_teacher: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Teacher',
  //   required: true,
  // },
  start_time: { type: Date, required: true },
  duration: { type: Number, required: true },
  theory_start_time: { type: Date },
  theory_duration: { type: Number },
});

const classExamTimetableSchema =
  new mongoose.Schema<ClassExamTimetableDocument>(
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
      term: { type: String, enum: termEnum, required: true },
      scheduled_subjects: [subjectScheduleSchema],
    },
    {
      timestamps: true,
    }
  );

const ClassExamTimetable = mongoose.model<ClassExamTimetableDocument>(
  'ClassExamTimetable',
  classExamTimetableSchema
);
export default ClassExamTimetable;
