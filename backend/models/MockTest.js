// models/MockTest.js
import mongoose from "mongoose";

// Subject Schema
const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
}, { _id: false });

// Attempt Schema
const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answers: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
            selectedAnswer: String,
            isCorrect: Boolean,
        },
    ],
    score: Number,
    submittedAt: Date,
});

// Main MockTest Schema
const MockTestSchema = new mongoose.Schema({
    subcategory: String,
    title: { type: String, required: true },
    description: String,
    durationMinutes: { type: Number, default: 60 },

    totalQuestions: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    negativeMarking: { type: Number, default: 0 },

    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, default: 0 },

    // 🔥 Thumbnail + Free flag
    thumbnail: { type: String, default: null },
    isFree: { type: Boolean, default: false },

    // 🔥 PUBLISH STATUS (You were missing this!)
    isPublished: { type: Boolean, default: false },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    categorySlug: String,

    subjects: [SubjectSchema],

    questionIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
    ],

   isGrandTest: { type: Boolean, default: false },

    scheduledFor: {
        type: Date,
        required: function () {
            // This ensures scheduledFor is ONLY required if isGrandTest is true (or truthy).
            return this.isGrandTest;
        },
    },
    attempts: [attemptSchema],
}, { timestamps: true });

export default mongoose.model("MockTest", MockTestSchema);
