import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mocktestId: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },
    questions: { type: Array, default: [] }, // store snapshot of questions
    startedAt: Date,
    endsAt: Date,
    submittedAt: Date,
    score: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
  },
  { timestamps: true }
);

export default mongoose.model("Attempt", attemptSchema);
