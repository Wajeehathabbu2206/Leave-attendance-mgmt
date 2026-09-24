import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    rollNo: { type: String, required: true, trim: true },
    parentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

studentSchema.index({ classSectionId: 1, rollNo: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);