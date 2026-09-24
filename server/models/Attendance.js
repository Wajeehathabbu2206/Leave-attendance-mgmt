import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true },
);

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);