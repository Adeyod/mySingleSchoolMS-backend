import mongoose from 'mongoose';

const studentBackupSchema = new mongoose.Schema(
  {
    student_data: { type: Object, required: true },
    moved_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const StudentBackup = mongoose.model('StudentBackup', studentBackupSchema);
export default StudentBackup;
