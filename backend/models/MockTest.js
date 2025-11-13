// models/MockTest.js
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  level: { type: String, enum: ["easy", "medium", "hard"], required: true },
  questionText: { type: String, required: true },
  options: [{ type: String }], // Expect 4 options normally
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  explanation: String,
}, { timestamps: true });


const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [
    {
      questionId: String,
      selectedAnswer: String,
      isCorrect: Boolean,
    },
  ],
  score: Number,
  submittedAt: Date,
});

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
});

const MockTestSchema = new mongoose.Schema({
 // e.g. 'ssc'
  subcategory: String, // optional subcategory
  title: { type: String, required: true },
  description: String,
  durationMinutes: { type: Number, default: 60 },
  totalQuestions: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  negativeMarking: { type: Number, default: 0 }, // per question negative mark
  price: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category',required: true },
  categorySlug: String, 
  discountPrice: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  subjects: [SubjectSchema],
  questions: [QuestionSchema],
}, { timestamps: true });

export default mongoose.model("MockTest", MockTestSchema);
