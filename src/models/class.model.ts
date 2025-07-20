import mongoose, { Schema } from 'mongoose';
import { streamEnum } from '../constants/enum';
import { ClassDocument } from '../constants/types';

const classSchema = new mongoose.Schema<ClassDocument>(
  {
    name: { type: String, required: true, unique: true }, // class name(JSS 1A)
    level: { type: String, required: true }, // Level (JSS 1, JSS 2, etc)
    section: { type: String, required: true }, // Section(A, B, C etc)
    description: { type: String },
    // arms: [{ type: String }],
    // streams: [{ type: String, enum: streamEnum }],
    class_teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    compulsory_subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    // optional_subjects: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Subject',
    //   },
    // ],
    teacher_subject_assignments: [
      {
        teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
        subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

classSchema.index({ name: 1, level: 1, section: 1 }, { unique: true });

const Class = mongoose.model<ClassDocument>('Class', classSchema);
export default Class;
