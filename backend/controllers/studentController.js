import MockTest from "../models/MockTest.js";
import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";
import mongoose from "mongoose";
import Usermodel from "../models/Usermodel.js";
import Order from '../models/Order.js';

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
    
    // --- 👇 2. ADDED ACCESS CONTROL LOGIC ---
    // A. Check if user has purchased this test
    const order = await Order.findOne({
      user: studentId,
      items: mocktestId, // Check if mocktestId is in the 'items' array
      status: 'successful'
    });

    // If it's a paid test (price > 0) AND it's NOT a Grand Test, check for purchase
    // We assume Grand Tests are *always* paid, so we check for all paid tests
    if (mocktest.price > 0 && !order) {
      return res.status(403).json({ success: false, message: "You have not purchased this test. Please buy it first." });
    }
    
    let examEndTime;
    const now = new Date();
    // B. Check if it's a Grand Test and if the time is correct
    if (mocktest.isGrandTest) {
      const startTime = new Date(mocktest.scheduledFor);
      // Calculate end time (start time + duration)
      const endTime = new Date(startTime.getTime() + mocktest.durationMinutes * 60000);

      if (now < startTime) {
        return res.status(403).json({
          success: false,
          message: `This Grand Test is not available yet. It starts at ${startTime.toLocaleString()}`
        });
      }

      if (now > endTime) {
        return res.status(403).json({ success: false, message: 'The time window for this Grand Test has closed.' });
      }

    }
    else {
      // For regular mock tests, the end time is relative to when they start
      examEndTime = new Date(now.getTime() + mocktest.durationMinutes * 60000);
    }
    // --
    // --- 👆 END OF ACCESS CONTROL LOGIC ---


    // --- Your existing logic for fetching questions ---
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
    // --- End of your existing logic ---

    if (questionsForAttempt.length === 0) {
      return res.status(400).json({ success: false, message: "No questions found for this test configuration. Make sure you have uploaded questions to the global pool." });
    }

    // Shuffle the final array
    // Shuffle the final array
    questionsForAttempt.sort(() => Math.random() - 0.5);
    
    const endsAt = mocktest.isGrandTest ? examEndTime : new Date(now.getTime() + mocktest.durationMinutes * 60000);

    const attempt = await Attempt.create({
      studentId,
      mocktestId,
      questions: questionsForAttempt,
      startedAt: now,
      endsAt: endsAt,
      status: "in-progress"
    });
    // --- 3. ADD ATTEMPT TO USER MODEL ---
    // This makes sure the "Tests Completed" count on the dashboard is accurate
    await Usermodel.findByIdAndUpdate(studentId, { $push: { attempts: attempt._id } });
    // --- 👆 END OF NEW LOGIC ---

    res.json({ 
      success: true, 
      attemptId: attempt._id, 
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
