import MockTest from "../models/MockTest.js";
import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";
import mongoose from "mongoose";
import Usermodel from "../models/Usermodel.js";
import Order from '../models/Order.js';

// Helper function for array randomization (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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
    if (!mocktest)
      return res.status(404).json({ success: false, message: "Mocktest not found" });

    // ----------------------------------------------------
    // 📌 ACCESS CONTROL
    // ----------------------------------------------------
    const order = await Order.findOne({
      user: studentId,
      items: mocktestId,
      status: "successful",
    });

    const now = new Date();
    let examEndTime;

    if (mocktest.price > 0 && !order) {
      return res.status(403).json({
        success: false,
        message: "You have not purchased this test.",
      });
    }

    if (mocktest.isGrandTest) {
      const startTime = new Date(mocktest.scheduledFor);
      examEndTime = new Date(
        startTime.getTime() + mocktest.durationMinutes * 60000
      );

      if (now < startTime) {
        return res.status(403).json({
          success: false,
          message: `This Grand Test starts at ${startTime.toLocaleString()}`,
        });
      }

      if (now > examEndTime) {
        return res.status(403).json({
          success: false,
          message: "Time window for this Grand Test is closed.",
        });
      }
    } else {
      examEndTime = new Date(
        now.getTime() + mocktest.durationMinutes * 60000
      );
    }

    // ----------------------------------------------------
    // 📌 HYBRID QUESTION SELECTION
    // ----------------------------------------------------
    let questionsForAttempt = [];

    // ------- 1️⃣ USE ADMIN ATTACHED QUESTIONS FIRST -------
    if (Array.isArray(mocktest.questionIds) && mocktest.questionIds.length > 0) {
      const qs = await Question.find({
        _id: { $in: mocktest.questionIds },
      }).lean();

      // preserve admin order
      const map = {};
      qs.forEach((q) => (map[q._id.toString()] = q));

      const ordered = mocktest.questionIds
        .map((id) => map[id.toString()])
        .filter(Boolean);

      questionsForAttempt = ordered.map((q) => ({
        _id: q._id,
        subject: q.category,
        level: q.difficulty,
        questionText: q.title,
        questionImageUrl: q.questionImageUrl || null,
        options: (q.options || []).map((opt) => ({
          text: opt.text || "",
          imageUrl: opt.imageUrl || null,
        })),
        correct: q.correct,
        marks: q.marks,
        negative: q.negative,
        explanation: q.explanation || null,
        questionType: q.questionType || "mcq",
        correctManualAnswer: q.correctManualAnswer || null,
      }));
    } // 👈 THIS BRACE WAS MISSING IN YOUR CODE!

    // ------- 2️⃣ FALLBACK: SUBJECT + DIFFICULTY SELECTION -------
    if (questionsForAttempt.length === 0) {
      const subjectMap = new Map();

      for (const sub of mocktest.subjects || []) {
        const { name, easy = 0, medium = 0, hard = 0 } = sub;

        if (!subjectMap.has(name)) {
          subjectMap.set(name, { easy: 0, medium: 0, hard: 0 });
        }

        const s = subjectMap.get(name);
        s.easy += Number(easy);
        s.medium += Number(medium);
        s.hard += Number(hard);
      }

      const fetchQuestions = async (subjectName, difficulty, count) => {
        if (count <= 0) return [];

        const selected = await Question.aggregate([
          { $match: { category: subjectName, difficulty } },
          { $sample: { size: count } },
        ]);

        return selected.map((q) => ({
          _id: q._id,
          subject: q.category,
          level: q.difficulty,
          questionText: q.title,
          questionImageUrl: q.questionImageUrl || null,
          options: (q.options || []).map((opt) => ({
            text: opt.text || "",
            imageUrl: opt.imageUrl || null,
          })),
          correct: q.correct,
          marks: q.marks,
          negative: q.negative,
          explanation: q.explanation || null,
          questionType: q.questionType,
          correctManualAnswer: q.correctManualAnswer || null,
        }));
      };

      const promises = [];

      for (const [name, counts] of subjectMap.entries()) {
        promises.push(fetchQuestions(name, "easy", counts.easy));
        promises.push(fetchQuestions(name, "medium", counts.medium));
        promises.push(fetchQuestions(name, "hard", counts.hard));
      }

      const arrays = await Promise.all(promises);

      questionsForAttempt = arrays.flat();
    }

    // No questions
    if (!questionsForAttempt.length) {
      return res.status(400).json({
        success: false,
        message: "No questions found for this test.",
      });
    }

    // Shuffle
    questionsForAttempt = shuffleArray(questionsForAttempt);

    const endsAt = mocktest.isGrandTest
      ? examEndTime
      : new Date(now.getTime() + mocktest.durationMinutes * 60000);

    // ----------------------------------------------------
    // 📌 CREATE ATTEMPT
    // ----------------------------------------------------
    const attempt = await Attempt.create({
      studentId,
      mocktestId,
      questions: questionsForAttempt,
      answers: [],
      startedAt: now,
      endsAt,
      status: "in-progress",
    });

    await Usermodel.findByIdAndUpdate(studentId, {
      $push: { attempts: attempt._id },
    });

    // Remove correct answers from frontend
    const safeQuestions = questionsForAttempt.map((q) => {
      const { correct, correctManualAnswer, ...rest } = q;
      return rest;
    });

    return res.json({
      success: true,
      attemptId: attempt._id,
      endsAt,
      questions: safeQuestions,
    });
  } catch (err) {
    console.error("❌ Error in startMocktest:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};



export const submitMocktest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // array

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });
    if (attempt.status === "completed") return res.status(400).json({ success: false, message: "Test already submitted." });

    let score = 0;
    let correctCount = 0;
    const processedAnswers = [];

    const attemptQuestions = attempt.questions || [];

    for (const q of attemptQuestions) {
      const userAns = Array.isArray(answers) ? answers.find(a => a.questionId === q._id.toString()) : null;
      const selectedAnswer = userAns ? userAns.selectedAnswer : null;
      let isCorrect = false;

      if (q.questionType === "mcq") {
        // q.options are objects; q.correct contains indices
        // selectedAnswer is expected to be either option text or option index depending on frontend; we normalized frontend to send option text for simplicity
        // Find index of selectedAnswer in options (matching on text)
        const selectedIndex = q.options && q.options.length ? q.options.findIndex(o => {
          if (typeof selectedAnswer === "string") return (o.text || "").toString() === selectedAnswer.toString();
          return Number(selectedAnswer) === (o.index || -1);
        }) : -1;

        if (userAns && q.correct && q.correct.includes(selectedIndex)) {
          score += q.marks || 0;
          correctCount++;
          isCorrect = true;
        } else if (userAns && selectedAnswer != null) {
          score -= q.negative || 0;
        }

        processedAnswers.push({
          questionId: q._id.toString(),
          selectedAnswer,
          correctAnswer: q.options && q.options[q.correct && q.correct[0]] ? q.options[q.correct[0]].text : null,
          isCorrect,
          marks: q.marks,
          negativeMarks: q.negative,
          questionText: q.questionText
        });
      } else if (q.questionType === "manual") {
        const isManualCorrect = userAns && selectedAnswer && q.correctManualAnswer &&
          selectedAnswer.toString().trim().toLowerCase() === q.correctManualAnswer.toString().trim().toLowerCase();

        if (isManualCorrect) {
          score += q.marks || 0;
          correctCount++;
          isCorrect = true;
        } else if (userAns && selectedAnswer) {
          score -= q.negative || 0;
        }

        processedAnswers.push({
          questionId: q._id.toString(),
          selectedAnswer,
          correctAnswer: q.correctManualAnswer,
          isCorrect,
          marks: q.marks,
          negativeMarks: q.negative,
          questionText: q.questionText
        });
      }
    }

    attempt.score = score;
    attempt.correctCount = correctCount;
    attempt.status = "completed";
    attempt.submittedAt = new Date();
    attempt.answers = processedAnswers;
    await attempt.save();

    res.json({ success: true, score, correctCount, total: attempt.questions.length, attemptId: attempt._id });
  } catch (err) {
    console.error("❌ Error in submitMocktest:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyPurchasedTests = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await Usermodel.findById(userId)
      .populate({
        path: "purchasedTests",
        model: "MockTest",
        // --- 👇 ADDED isGrandTest and scheduledFor ---
        select: "title description durationMinutes totalQuestions categorySlug subjects isGrandTest scheduledFor"
        // --- 👆 END OF CHANGE ---
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

    const attempt = await Attempt.findById(attemptId).populate("mocktestId", "title");
    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });
    if (attempt.studentId.toString() !== studentId) return res.status(403).json({ success: false, message: "Not authorized" });
    if (attempt.status === "completed") return res.status(400).json({ success: false, message: "Test already completed.", redirectTo: `/student/results/${attempt._id}` });

    const safeAnswers = Array.isArray(attempt.answers) ? attempt.answers : [];
    const questions = (attempt.questions || []).map(q => {
      const { correct, correctManualAnswer, ...rest } = q;
      return rest;
    });

    res.json({
      _id: attempt._id,
      mocktestId: attempt.mocktestId,
      endsAt: attempt.endsAt,
      status: attempt.status,
      questions,
      answers: safeAnswers.map(a => ({ questionId: a.questionId, selectedAnswer: a.selectedAnswer }))
    });
  } catch (err) {
    console.error("❌ Error in getAttemptById:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const getGrandTestLeaderboard = async (req, res) => {
  try {
    const { mockTestId } = req.params;

    // 1. Find the test to confirm it's a Grand Test and get its info
    const grandTest = await MockTest.findById(mockTestId);
    if (!grandTest || !grandTest.isGrandTest) {
      return res.status(404).json({ message: 'Grand Test not found.' });
    }

    // 2. Check if the test time is over before showing leaderboard
    const now = new Date();
    const startTime = new Date(grandTest.scheduledFor);
    const endTime = new Date(startTime.getTime() + grandTest.durationMinutes * 60000);

    if (now < endTime) {
      return res.status(400).json({ message: 'Leaderboard will be available after the test is over.' });
    }

    // 3. Find top 3 attempts for this test
    const leaderboard = await Attempt.find({ 
        mocktestId: mockTestId, 
        status: 'completed' 
      })
      .sort({ score: -1 }) // Sort by score descending
      .limit(3) // Get top 3
      .populate('studentId', 'name'); // Get student's name from User model

    // 4. Format the result
    const formattedLeaderboard = leaderboard.map((attempt, index) => ({
      rank: index + 1,
      name: attempt.studentId ? attempt.studentId.name : 'Unknown User',
      score: attempt.score,
    }));

    res.status(200).json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard.' });
  }
};