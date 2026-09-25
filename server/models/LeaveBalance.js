import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "other"],
      required: true,
    },
    totalAllotted: { type: Number, required: true, min: 0 },
    used: { type: Number, default: 0, min: 0 },
    academicYear: { type: String, required: true, match: /^\d{4}-\d{4}$/ },
  },
  { timestamps: true },
);

leaveBalanceSchema.index(
  { studentId: 1, leaveType: 1, academicYear: 1 },
  { unique: true },
);

export default mongoose.model("LeaveBalance", leaveBalanceSchema);
