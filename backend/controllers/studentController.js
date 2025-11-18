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
// -----------------------------------------------------------------------------
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

    let examEndTime;
    const now = new Date();
    
    // If it's a paid test (price > 0) AND it's NOT a Grand Test, check for purchase
    // We assume Grand Tests are *always* paid, so we check for all paid tests
    if (mocktest.price > 0 && !order) {
      return res.status(403).json({ success: false, message: "You have not purchased this test. Please buy it first." });
    }
    
    // B. Check if it's a Grand Test and if the time is correct
    if (mocktest.isGrandTest) {
      const startTime = new Date(mocktest.scheduledFor);
      // Calculate end time (start time + duration)
      examEndTime = new Date(startTime.getTime() + mocktest.durationMinutes * 60000);

      if (now < startTime) {
        return res.status(403).json({
          success: false,
          message: `This Grand Test is not available yet. It starts at ${startTime.toLocaleString()}`
        });
      }

      if (now > examEndTime) {
        return res.status(403).json({ success: false, message: 'The time window for this Grand Test has closed.' });
      }

    }
    else {
      // For regular mock tests, the end time is relative to when they start
      examEndTime = new Date(now.getTime() + mocktest.durationMinutes * 60000);
    }
    // --
    // --- 👆 END OF ACCESS CONTROL LOGIC ---


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

    // Helper function to fetch questions (Queries global Question collection with randomization)
    const fetchQuestions = async (subjectName, difficulty, count) => {
      if (count <= 0) return [];
      
      const aggregationPipeline = [
        // 1. Match questions by category and difficulty
        { $match: { category: subjectName, difficulty: difficulty } },
        // 2. Select a random sample of the required size
        { $sample: { size: count } }
      ];

      const selectedQuestions = await Question.aggregate(aggregationPipeline);
      
      // Map global Question data to the embedded format expected by Attempt model's questions array.
      return selectedQuestions.map(q => {
          // Map options array of objects to array of text strings 
          const optionsText = Array.isArray(q.options) 
              ? q.options.map(opt => opt.text).filter(t => t != null) 
              : [];
              
          return {
              _id: q._id,
              subject: q.category, 
              level: q.difficulty,
              questionText: q.title,
              options: optionsText,
              correct: q.correct, // Array of indices
              marks: q.marks,
              negative: q.negative,
              explanation: q.explanation || null,
              questionType: q.questionType || 'mcq',
              correctManualAnswer: q.correctManualAnswer || null
          };
      });
    };

    // 2. Create an array of promises and fetch questions
    const fetchPromises = [];
    for (const [name, counts] of subjectMap.entries()) {
      fetchPromises.push(fetchQuestions(name, "easy", counts.easy));
      fetchPromises.push(fetchQuestions(name, "medium", counts.medium));
      fetchPromises.push(fetchQuestions(name, "hard", counts.hard));
    }

    // 3. Run all fetches in parallel and combine results
    const allQuestionArrays = await Promise.all(fetchPromises);
    questionsForAttempt = allQuestionArrays.flat();

    if (questionsForAttempt.length === 0) {
      // Fallback to manually embedded questions if no breakdown worked
      if (mocktest.questions && mocktest.questions.length > 0) {
        questionsForAttempt = mocktest.questions;
      } else {
        return res.status(400).json({ success: false, message: "No questions found for this test configuration. Ensure questions matching the subject quotas are uploaded to the global pool." });
      }
    }

    // Shuffle the final array to mix up subjects/difficulties
    questionsForAttempt = shuffleArray(questionsForAttempt);
    
    // Determine endsAt time
    const endsAt = mocktest.isGrandTest ? examEndTime : new Date(now.getTime() + mocktest.durationMinutes * 60000);

    const attempt = await Attempt.create({
      studentId,
      mocktestId,
      questions: questionsForAttempt, // The array of question objects
      startedAt: now,
      endsAt: endsAt,
      status: "in-progress"
    });
    
    // --- 3. ADD ATTEMPT TO USER MODEL ---
    await Usermodel.findByIdAndUpdate(studentId, { $push: { attempts: attempt._id } });
    // --- 👆 END OF NEW LOGIC ---

    // Prepare questions for client (omitting correct answers)
    const safeQuestions = questionsForAttempt.map(q => {
        const { correct, correctAnswer, negative, correctManualAnswer, ...safeQ } = q;
        return safeQ;
    });

    res.json({ 
      success: true, 
      attemptId: attempt._id, 
      endsAt: endsAt,
      questions: safeQuestions // Return the questions directly
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
    const { answers } = req.body; 

    // Find the attempt and manually populate the 'questions' array with the *embedded* question data
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
      const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : null; 

      if (q.questionType === 'mcq') {
          // Find the index of the selected answer string in the options array
          const selectedIndex = Array.isArray(q.options) ? q.options.findIndex(optText => optText === selectedAnswer) : -1;
          
          // Check if the selected index is in the correct indices array (q.correct)
          if (userAnswer && q.correct && q.correct.includes(selectedIndex)) {
            score += q.marks;
            correctCount++;
            isCorrect = true;
          } else if (userAnswer && selectedAnswer) {
            // Apply negative marking only if an answer was given
            score -= q.negative;
          }

          processedAnswers.push({
            questionId: q._id.toString(),
            selectedAnswer: selectedAnswer,
            correctAnswer: q.options[q.correct[0]], // Assuming single correct answer for display
            isCorrect: isCorrect,
            marks: q.marks,
            negativeMarks: q.negative,
            questionText: q.questionText || q.title,
            options: q.options
          });
      } else if (q.questionType === 'manual') {
          // Manual question auto-grading based on exact match (case-insensitive and trimmed for robustness)
          const isManualCorrect = userAnswer && 
                                  userAnswer.selectedAnswer &&
                                  q.correctManualAnswer &&
                                  userAnswer.selectedAnswer.toString().trim().toLowerCase() === q.correctManualAnswer.toString().trim().toLowerCase();

          if (isManualCorrect) {
             score += q.marks;
             correctCount++;
             isCorrect = true;
          } else if (userAnswer && userAnswer.selectedAnswer) {
             // Apply negative marking for incorrect manual answer
             score -= q.negative;
          }
          
          processedAnswers.push({
            questionId: q._id.toString(),
            selectedAnswer: userAnswer ? userAnswer.selectedAnswer : null,
            correctAnswer: q.correctManualAnswer,
            isCorrect: isCorrect,
            marks: q.marks,
            negativeMarks: q.negative,
            questionText: q.questionText || q.title,
          });
      }
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
      const { correct, correctAnswer, negative, correctManualAnswer, ...rest } = q; 
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