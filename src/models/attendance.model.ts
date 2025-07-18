import mongoose, { Schema } from 'mongoose';
import { attendanceEnum, termEnum } from '../constants/enum';
import { AttendanceDocument } from '../constants/types';

const attendanceRecordSchema = new mongoose.Schema({
  date: { type: Date },
  students: [
    {
      student: { type: Schema.Types.ObjectId, ref: 'Student' },
      status: { type: String, enum: attendanceEnum },
    },
  ],
});

const attendanceSchema = new mongoose.Schema(
  {
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    class_enrolment: {
      type: Schema.Types.ObjectId,
      ref: 'ClassEnrolment',
      required: true,
    },
    class_teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    first_term_attendance: [attendanceRecordSchema],
    second_term_attendance: [attendanceRecordSchema],
    third_term_attendance: [attendanceRecordSchema],
  },
  { timestamps: true }
);

// attendanceSchema.index({ enrolment: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model<AttendanceDocument>(
  'Attendance',
  attendanceSchema
);
export default Attendance;
