import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["admin", "teacher", "student", "parent"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
