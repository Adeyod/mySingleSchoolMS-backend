import mongoose, { Schema } from 'mongoose';
import { gradeEnum, termEnum } from '../constants/enum';
import { GradingType } from '../constants/types';
import { calculateSubjectPositions } from '../repository/result.repository';

const gradingSchema = new mongoose.Schema<GradingType>(
  {
    enrolment: {
      type: Schema.Types.ObjectId,
      ref: 'ClassEnrolment',
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    term: { type: String, enum: termEnum, required: true }, // Track term
    first_test_score: { type: Number, default: null }, // e.g., out of 20
    second_test_score: { type: Number, default: null },
    exam_score: { type: Number, default: null },
    total_score: { type: Number, default: null },
    position: { type: Number, default: null },
    grade: { type: String, enum: gradeEnum, default: gradeEnum[0] },
  },
  {
    timestamps: true,
  }
);

gradingSchema.pre('save', async function (next) {
  const allScoresAvailable =
    this.first_test_score !== null &&
    this.second_test_score !== null &&
    this.exam_score !== null;

  if (allScoresAvailable) {
    this.total_score =
      this.first_test_score + this.second_test_score + this.exam_score;

    const total = this.total_score;
    if (total >= 70) this.grade = 'A';
    if (total >= 60 && total < 70) this.grade = 'B';
    if (total >= 50 && total < 60) this.grade = 'C';
    if (total >= 45 && total < 50) this.grade = 'D';
    if (total >= 40 && total < 45) this.grade = 'E';
    else this.grade = 'F';

    await calculateSubjectPositions(this.subject);
  } else {
    this.total_score = null;
    this.grade = null;
  }

  next();
});

const Grading = mongoose.model('Grading', gradingSchema);

export default Grading;
