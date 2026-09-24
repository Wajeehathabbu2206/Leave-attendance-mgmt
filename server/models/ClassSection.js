import mongoose from 'mongoose';

const classSectionSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true, uppercase: true },
    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

classSectionSchema.index({ grade: 1, section: 1 }, { unique: true });

export default mongoose.model('ClassSection', classSectionSchema);