import mongoose, { Schema } from 'mongoose';
import { termEnum } from '../constants/enum';

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    term: { type: String, required: true, enum: termEnum },
    academic_session: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Session',
    },
  },
  {
    timestamps: true,
  }
);

const TeacherAssignment = mongoose.model(
  'TeacherAssignment',
  teacherAssignmentSchema
);
export default TeacherAssignment;
