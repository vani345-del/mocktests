import MockTest from "../models/MockTest.js";
import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";
import mongoose from "mongoose";
import Usermodel from "../models/Usermodel.js";

// -----------------------------------------------------------------------------
// 1️⃣ Get Available Mocktests
// -----------------------------------------------------------------------------
export const getAvailableMocktests = async (req, res) => {
  try {
    const now = new Date();

    const tests = await MockTest.find({
      availableFrom: { $lte: now },
      availableTo: { $gte: now }
    }).sort({ createdAt: -1 });

    res.json({ success: true, tests });
  } catch (err) {
    console.error("❌ Error in getAvailableMocktests:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------------------------------------------
// 2️⃣ Start a Mocktest Attempt (AUTH REQUIRED)
export const startMocktest = async (req, res) => {
  try {
    const { mocktestId } = req.params;
    const studentId = req.user.id;

    const mocktest = await MockTest.findById(mocktestId);
    if (!mocktest) {
      return res.status(404).json({ success: false, message: "Mocktest not found" });
    }

    // --- New Logic Starts Here ---
    let questionsForAttempt = [];

    // 1. Aggregate counts for each subject
    const subjectMap = new Map();
    for (const subject of mocktest.subjects) {
      const { name, easy, medium, hard } = subject;
      if (!subjectMap.has(name)) {
        subjectMap.set(name, { easy: 0, medium: 0, hard: 0 });
      }
      const counts = subjectMap.get(name);
      counts.easy += easy;
      counts.medium += medium;
      counts.hard += hard;
    }

    // Helper function to fetch questions
    const fetchQuestions = async (subjectName, difficulty, count) => {
      if (count <= 0) return [];
      // Your Question.js model uses 'category' for the subject name
      return Question.aggregate([
        { $match: { category: subjectName, difficulty: difficulty } },
        { $sample: { size: count } }
      ]);
    };

    // 2. Create an array of promises
    const fetchPromises = [];
    for (const [name, counts] of subjectMap.entries()) {
      fetchPromises.push(fetchQuestions(name, "easy", counts.easy));
      fetchPromises.push(fetchQuestions(name, "medium", counts.medium));
      fetchPromises.push(fetchQuestions(name, "hard", counts.hard));
    }

    // 3. Run all fetches in parallel
    const allQuestionArrays = await Promise.all(fetchPromises);
    questionsForAttempt = allQuestionArrays.flat(); // Combine all results
    // --- End of New Logic ---

    if (questionsForAttempt.length === 0) {
      return res.status(400).json({ success: false, message: "No questions found for this test configuration. Make sure you have uploaded questions to the global pool." });
    }

    // Shuffle the final array
    questionsForAttempt.sort(() => Math.random() - 0.5);
    
    const now = new Date();
    const endsAt = new Date(now.getTime() + mocktest.durationMinutes * 60000);

    const attempt = await Attempt.create({
      studentId,
      mocktestId,
      questions: questionsForAttempt,
      startedAt: now,
      endsAt: endsAt,
      status: "in-progress"
    });

    res.json({ 
      success: true, 
      attemptId: attempt._id, // This will now be a valid ID
      endsAt: endsAt 
    });

  } catch (err) {
    console.error("❌ Error in startMocktest:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// -----------------------------------------------------------------------------
// 3️⃣ Submit Mocktest Answers
// -----------------------------------------------------------------------------
export const submitMocktest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    // ⭐ Ensure answers are in the format: [{ questionId, selectedAnswer }]
    //    Your MockTest.js model had `correctAnswer` as a String,
    //    but Question.js had `correct` as a [Number] index.
    //    The code below assumes `Question.js` is the correct source,
    //    and that `q.correct` is an array of correct *indices*.
    //    This code assumes single-choice answers (q.correct[0]).
    const { answers } = req.body; 

    const attempt = await Attempt.findById(attemptId);
    if (!attempt)
      return res.status(404).json({ success: false, message: "Attempt not found" });

    if (attempt.status === "completed") {
      return res.status(400).json({ success: false, message: "Test already submitted." });
    }

    let score = 0;
    let correctCount = 0;
    let processedAnswers = []; // To store the results

    attempt.questions.forEach((q) => {
      // Find the user's answer for this question
      const userAnswer = answers.find((a) => a.questionId === q._id.toString());
      
      let isCorrect = false;
      const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : null; // `selectedAnswer` is the *string* of the chosen option

      // Find the index of the selected answer
      const selectedIndex = q.options.indexOf(selectedAnswer);

      if (userAnswer && q.correct.includes(selectedIndex)) {
        score += q.marks;
        correctCount++;
        isCorrect = true;
      } else if (userAnswer) {
        // Apply negative marking only if an answer was given
        score -= q.negative;
      }

      processedAnswers.push({
        questionId: q._id.toString(),
        selectedAnswer: selectedAnswer,
        correctAnswer: q.options[q.correct[0]], // Assuming single correct answer
        isCorrect: isCorrect,
        marks: q.marks,
        negativeMarks: q.negative,
        questionText: q.title,
        options: q.options
      });
    });

    attempt.score = score;
    attempt.correctCount = correctCount;
    attempt.status = "completed";
    attempt.submittedAt = new Date();
    attempt.answers = processedAnswers; // Store the processed answers

    await attempt.save();

    res.json({
      success: true,
      score,
      correctCount,
      total: attempt.questions.length,
      attemptId: attempt._id
    });
  } catch (err) {
    console.error("❌ Error in submitMocktest:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// -----------------------------------------------------------------------------
// 4️⃣ Get My Purchased Mocktests
// -----------------------------------------------------------------------------
export const getMyPurchasedTests = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await Usermodel.findById(userId)
      .populate({
        path: "purchasedTests",
        model: "MockTest",
        select: "title description durationMinutes totalQuestions categorySlug subjects"
      })
      .select("purchasedTests");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.purchasedTests);

  } catch (error) {
    console.error("Error fetching purchased tests:", error);
    res.status(500).json({ message: "Server error. Could not fetch tests." });
  }
};

// ... other controllers

// -----------------------------------------------------------------------------
// 5️⃣ Get a Specific Attempt (AUTH REQUIRED)
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 5️⃣ Get a Specific Attempt (AUTH REQUIRED)
// -----------------------------------------------------------------------------
export const getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.id; 

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ success: false, message: "Invalid attempt ID" });
    }

    const attempt = await Attempt.findById(attemptId)
                                .populate('mocktestId', 'title'); 

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    if (attempt.studentId.toString() !== studentId) {
      return res.status(403).json({ success: false, message: "Not authorized to view this attempt" });
    }
    
    if (attempt.status === 'completed') {
       return res.status(400).json({ 
         success: false, 
         message: "Test already completed.",
         redirectTo: `/student/results/${attempt._id}` 
       });
    }
    
    // Don't send correct answers to the client
    const questions = attempt.questions.map(q => {
      // Create a copy of the question and remove the 'correct' field
      const { correct, ...rest } = q; 
      return rest;
    });

    res.json({
      _id: attempt._id,
      mocktestId: attempt.mocktestId,
      endsAt: attempt.endsAt,
      status: attempt.status,
      questions: questions,
      answers: (attempt.answers || []).map(a => ({ 
        questionId: a.questionId, 
        selectedAnswer: a.selectedAnswer 
      }))
    });

  } catch (err) {
    console.error("❌ Error in getAttemptById:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

