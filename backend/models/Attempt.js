// backend/models/Attempt.js
import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mocktestId: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },
    questions: { type: Array, default: [] }, // store snapshot of questions
    
    // --- NEW: Flexible field to store all student answers ---
    // Format: { 
    //   "questionId1": { "selected": [0, 2], "manual": null },
    //   "questionId2": { "selected": null, "manual": "Student's typed answer" }
    // }
    answers: { 
      type: mongoose.Schema.Types.Mixed, 
      default: {} 
    },
    
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