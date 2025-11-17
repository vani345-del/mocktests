// backend/models/Question.js
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String },
  imageUrl: { type: String }
}, { _id: false }); // --- UPDATED --- No internal _id for options

const questionSchema = new mongoose.Schema(
  {
    // --- NEW: Type of question ---
    questionType: {
      type: String,
      enum: ["mcq", "manual"],
      default: "mcq",
    },
    // --- NEW: URL for a question image (like a graph) ---
    questionImageUrl: { 
      type: String, 
      default: null 
    },
    title: { type: String, required: true }, // Question text
    // --- UPDATED: Options are now objects {text, imageUrl} ---
    options: { 
      type: [optionSchema],
      // Required only if it's a multiple-choice question
      required: function() { return this.questionType === 'mcq'; } 
    }, 
    // --- UPDATED: This remains the index for 'mcq' types ---
    correct: { 
      type: [Number], 
      required: function() { return this.questionType === 'mcq'; }
    },
    // --- NEW: Field for the correct manual answer ---
    correctManualAnswer: {
      type: String,
      required: function() { return this.questionType === 'manual'; }
    },
    marks: { type: Number, default: 1 },
    negative: { type: Number, default: 0 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    category: { type: String, required: true }, // like Maths, GK, etc.
    tags: [String], // optional tags
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);