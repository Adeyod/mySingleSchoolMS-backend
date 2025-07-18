import mongoose from 'mongoose';
import { CbtExamDocument } from '../constants/types';

const cbtExamSchema = new mongoose.Schema<CbtExamDocument>(
  {
    academic_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    term: { type: String, required: true },
    min_obj_questions: { type: Number, required: true },
    max_obj_questions: { type: Number, required: true },
    number_of_questions_per_student: { type: Number, required: true },
    expected_obj_number_of_options: { type: Number, required: true },

    // Core exam info
    title: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const CbtExam = mongoose.model<CbtExamDocument>('CbtExam', cbtExamSchema);
export default CbtExam;
