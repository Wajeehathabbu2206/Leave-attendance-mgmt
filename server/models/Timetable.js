import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true, min: 1 },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
  dayOfWeek: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], required: true },
  periods: { type: [periodSchema], default: [] },
}, { timestamps: true });

timetableSchema.index({ classSectionId: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.model('Timetable', timetableSchema);