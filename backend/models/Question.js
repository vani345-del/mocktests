import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Question text
    options: { type: [String], required: true }, // ["Option 1", "Option 2", "Option 3", "Option 4"]
    correct: { type: [Number], required: true }, // index(es) of correct options [0,1]
    marks: { type: Number, default: 1 },
    negative: { type: Number, default: 0 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    category: { type: String, required: true }, // like Maths, GK, etc.
    tags: [String], // optional tags
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
