// backend/models/Question.js
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  imageUrl: { type: String, default: null }
}, { _id: false });

// Main question schema
const questionSchema = new mongoose.Schema({
  questionType: {
    type: String,
    enum: ["mcq", "manual"],
    default: "mcq"
  },

  // The question text (required)
  title: { type: String, required: [true, "Question text (title) is required"], trim: true },

  // Optional image for the question itself (diagram/graph)
  questionImageUrl: { type: String, default: null },

  // Options for MCQ: each option may have text and/or imageUrl
  options: {
    type: [optionSchema],
    required: function() { return this.questionType === "mcq"; },
    // Ensure at least 2 options for MCQ
    validate: {
      validator: function(arr) {
        if (this.questionType !== "mcq") return true;
        return Array.isArray(arr) && arr.length >= 2;
      },
      message: "MCQ must have at least 2 options."
    }
  },

  // Correct indices for MCQ (0-based). For single-correct MCQ, array of length 1
  correct: {
    type: [Number],
    required: function() { return this.questionType === "mcq"; },
    validate: {
      validator: function(arr) {
        if (this.questionType !== "mcq") return true;
        return Array.isArray(arr) && arr.length >= 1;
      },
      message: "MCQ must have at least one correct index."
    }
  },

  // For manual questions: expected answer (string). You can expand to allow multiple variants.
  correctManualAnswer: {
    type: String,
    required: function() { return this.questionType === "manual"; }
  },

  marks: { type: Number, default: 1 },
  negative: { type: Number, default: 0 },

  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },

  // category is subject identifier (string or slug). Validate presence.
  category: { type: String, required: [true, "Category/subject is required"] }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Optional pre-save normalization
questionSchema.pre("save", function(next) {
  if (this.title && typeof this.title === "string") this.title = this.title.trim();
  if (Array.isArray(this.options)) {
    this.options = this.options.map(opt => ({
      text: (opt.text || "").toString(),
      imageUrl: opt.imageUrl || null
    }));
  }
  next();
});

// JSON transform: show id instead of _id, remove __v
questionSchema.method("toJSON", function() {
  const obj = this.toObject({ virtuals: true });
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
});

export default mongoose.model("Question", questionSchema);
