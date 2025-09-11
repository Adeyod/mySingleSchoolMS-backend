import mongoose from 'mongoose';
import { CbtAssessmentDocument } from '../constants/types';

const cbtExamSchema = new mongoose.Schema<CbtAssessmentDocument>(
  {
    academic_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    term: { type: String, required: true },
    level: { type: String, required: true },
    min_obj_questions: { type: Number, required: true },
    max_obj_questions: { type: Number, required: true },
    number_of_questions_per_student: { type: Number, required: true },
    expected_obj_number_of_options: { type: Number, required: true },

    // Core exam info
    assessment_type: { type: String, required: true, trim: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const CbtExam = mongoose.model<CbtAssessmentDocument>('CbtExam', cbtExamSchema);
export default CbtExam;
