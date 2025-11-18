// models/MockTest.js - UPDATED
import mongoose from "mongoose";

// The structure for how many questions of each difficulty are needed per subject
const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
}, { _id: false }); // No _id for embedded schemas

// We remove the embedded QuestionSchema and use this for the attempt reference
const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answers: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Should reference the main Question model
            selectedAnswer: String, // Stored answer (e.g., selected option text or index)
            isCorrect: Boolean,
        },
    ],
    score: Number,
    submittedAt: Date,
});

const MockTestSchema = new mongoose.Schema({
    subcategory: String,
    title: { type: String, required: true },
    description: String,
    durationMinutes: { type: Number, default: 60 },
    // totalQuestions and totalMarks can be computed from the questions/subjects array
    totalQuestions: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    negativeMarking: { type: Number, default: 0 },
    price: { type: Number, required: true, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    categorySlug: String,
    discountPrice: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },

    // This defines the STRUCTURE/REQUIREMENTS for the test
    subjects: [SubjectSchema], 

    // This stores the REFERENCES to the actual questions chosen for this test
    // Use an ObjectId to reference the main Question collection
    questionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question', // <-- Reference your separate Question model
        required: true
    }],
    
    isGrandTest: { type: Boolean, default: false },
    scheduledFor: {
        type: Date,
        required: function() { return this.isGrandTest; } 
    },

    // You might want to move attempts to a separate collection for scaling, 
    // but keeping it here for simplicity:
    attempts: [attemptSchema], 

}, { timestamps: true });

export default mongoose.model("MockTest", MockTestSchema);