import MockTest from "../models/MockTest.js";
import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";
 import mongoose from "mongoose";
 import Usermodel from "../models/Usermodel.js";


// ✅ 1️⃣ Get available mocktests (for students)
export const getAvailableMocktests = async (req, res) => {
  try {
    const now = new Date();
    const tests = await MockTest.find({
      availableFrom: { $lte: now },
      availableTo: { $gte: now },
    }).sort({ createdAt: -1 });

    res.json({ success: true, tests });
  } catch (err) {
    console.error("❌ Error in getAvailableMocktests:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ 2️⃣ Start a mocktest attempt
export const startMocktest = async (req, res) => {
  try {
    const { mocktestId } = req.params;
   
// Generate dummy ObjectId for guest (valid 24-hex string)
const studentId = new mongoose.Types.ObjectId(); // temporary until auth is added

    const mocktest = await MockTest.findById(mocktestId);
    if (!mocktest)
      return res.status(404).json({ success: false, message: "Mocktest not found" });

    const now = new Date();
    if (now < mocktest.availableFrom || now > mocktest.availableTo)
      return res.status(400).json({ success: false, message: "Test not available now" });

    const totalQuestions = await Question.countDocuments();
    if (totalQuestions === 0)
      return res.status(400).json({ success: false, message: "No questions available" });

    const sampleSize = totalQuestions >= 10 ? 10 : totalQuestions;
    const questions = await Question.aggregate([{ $sample: { size: sampleSize } }]);

    const attempt = await Attempt.create({
      studentId,
      mocktestId,
      questions,
      startedAt: now,
      endsAt: new Date(now.getTime() + mocktest.duration * 60000),
      status: "in-progress",
    });

    res.json({ success: true, attemptId: attempt._id, questions });
  } catch (err) {
    console.error("❌ Error in startMocktest:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ 3️⃣ Submit mocktest answers
export const submitMocktest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // [{ questionId, selectedIndex }]

    const attempt = await Attempt.findById(attemptId);
    if (!attempt)
      return res.status(404).json({ success: false, message: "Attempt not found" });

    let score = 0;
    let correctCount = 0;

    attempt.questions.forEach((q) => {
      const userAnswer = answers.find((a) => a.questionId === q._id.toString());
      if (userAnswer && userAnswer.selectedIndex === q.correct[0]) {
        score += q.marks;
        correctCount++;
      } else {
        score -= q.negative;
      }
    });

    attempt.score = score;
    attempt.correctCount = correctCount;
    attempt.status = "completed";
    attempt.submittedAt = new Date();
    await attempt.save();

    res.json({
      success: true,
      score,
      correctCount,
      total: attempt.questions.length,
    });
  } catch (err) {
    console.error("❌ Error in submitMocktest:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyPurchasedTests = async (req, res) => {
  try {
    const userId = req.user.id; // From isAuth middleware

    // Find the user and populate the 'purchasedTests' field.
    // We select only the 'purchasedTests' and 'name' fields.
    const user = await Usermodel.findById(userId)
      .populate({
        path: "purchasedTests",
        model: "MockTest", // Explicitly tell mongoose which model to use
        // Optionally, select only the fields you need for the card
        select: "title description durationMinutes totalQuestions categorySlug", 
      })
      .select("purchasedTests name"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back just the array of populated tests
    res.status(200).json(user.purchasedTests);

  } catch (error) {
    console.error("Error fetching purchased tests:", error);
    res.status(500).json({ message: "Server error. Could not fetch tests." });
  }
};
