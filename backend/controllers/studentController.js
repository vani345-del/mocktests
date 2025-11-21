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
// helper

// Group passages and their children so passage appears once followed by its children
function groupPassagesAndChildren(items) {
  // items: array of question-like objects (may include passage objects)
  const byId = new Map();
  const passageOrder = [];
  const standalone = [];

  // index by id
  items.forEach((q) => {
    byId.set(q._id.toString(), q);
  });

  // gather passage ids first (in order)
  items.forEach((q) => {
    if (q.questionType === "passage" || q.isPassage) {
      passageOrder.push(q._id.toString());
    }
  });

  // build groups: for each passage push passage then its children (children reference parentQuestionId)
  const used = new Set();
  const result = [];

  // first, push passages with children
  for (const pid of passageOrder) {
    const passage = byId.get(pid);
    if (!passage) continue;
    result.push(passage);
    used.add(pid);

    // find children that reference this parent (preserve order from items)
    items.forEach((q) => {
      if (!q._id) return;
      const qid = q._id.toString();
      if (used.has(qid)) return;
      if (q.parentQuestionId && q.parentQuestionId.toString() === pid) {
        result.push(q);
        used.add(qid);
      }
    });
  }

  // now push remaining items that are not part of any passage-group and not yet used
  items.forEach((q) => {
    const qid = q._id?.toString();
    if (!qid) return;
    if (!used.has(qid)) {
      result.push(q);
      used.add(qid);
    }
  });

  return result;
}

export const startMocktest = async (req, res) => {
  try {
    const { mocktestId } = req.params;
    const studentId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(mocktestId)) {
      return res.status(400).json({ success: false, message: "Invalid mocktest id" });
    }

    const mocktest = await MockTest.findById(mocktestId).lean();
    if (!mocktest) return res.status(404).json({ success: false, message: "Mocktest not found" });

    // --- Access control: purchase for paid tests ---
    if (mocktest.price > 0) {
      const order = await Order.findOne({ user: studentId, items: mocktestId, status: "successful" });
      if (!order) {
        return res.status(403).json({ success: false, message: "You have not purchased this test." });
      }
    }

    const now = new Date();
    let endsAt;

    // Grand test scheduling window handling
    if (mocktest.isGrandTest) {
      if (!mocktest.scheduledFor) return res.status(400).json({ success: false, message: "Grand test missing scheduledFor" });
      const startTime = new Date(mocktest.scheduledFor);
      const examEndTime = new Date(startTime.getTime() + Number(mocktest.durationMinutes || 0) * 60000);
      if (now < startTime) return res.status(403).json({ success: false, message: `This Grand Test starts at ${startTime.toLocaleString()}` });
      if (now > examEndTime) return res.status(403).json({ success: false, message: "Time window for this Grand Test is closed." });
      endsAt = examEndTime;
    } else {
      endsAt = new Date(now.getTime() + Number(mocktest.durationMinutes || 0) * 60000);
    }

    // Build questions list for attempt
    let questionsForAttempt = [];

    // If mocktest.questionIds exists and has items -> fetch them in that order
    if (Array.isArray(mocktest.questionIds) && mocktest.questionIds.length > 0) {
      // get questions by ids
      const qs = await Question.find({ _id: { $in: mocktest.questionIds } }).lean();
      // create map for quick lookup and preserve order from mocktest.questionIds
      const map = {};
      qs.forEach((q) => { map[q._id.toString()] = q; });

      const ordered = mocktest.questionIds.map(id => map[id.toString()]).filter(Boolean);

      questionsForAttempt = ordered.map((q) => ({
        _id: q._id,
        questionType: q.questionType || "mcq",
        subject: q.category,
        level: q.difficulty,
        questionText: q.title || "",
        questionImageUrl: q.questionImageUrl || null,
        options: Array.isArray(q.options) ? q.options.map(opt => ({
          text: opt.text || "",
          imageUrl: opt.imageUrl || null
        })) : [],
        correct: q.correct || [],
        correctManualAnswer: q.correctManualAnswer || null,
        marks: q.marks || 1,
        negative: q.negative || 0,
        explanation: q.explanation || null,
        parentQuestionId: q.parentQuestionId || null,
        isPassage: !!(q.questionType === "passage" || q.isPassage),
      }));
    }

    // If no explicit questionIds, fallback to sampling by subjects config
    if (!questionsForAttempt.length) {
      // build subject counts from mocktest.subjects array
      const subjectCounts = {};
      (mocktest.subjects || []).forEach(s => {
        const name = s.name;
        subjectCounts[name] = subjectCounts[name] || { easy: 0, medium: 0, hard: 0 };
        subjectCounts[name].easy += Number(s.easy || 0);
        subjectCounts[name].medium += Number(s.medium || 0);
        subjectCounts[name].hard += Number(s.hard || 0);
      });

      // aggregate queries
      const fetches = [];
      for (const [name, counts] of Object.entries(subjectCounts)) {
        for (const level of ["easy", "medium", "hard"]) {
          const count = counts[level] || 0;
          if (count > 0) {
            fetches.push(
              Question.aggregate([
                { $match: { category: name, difficulty: level } },
                { $sample: { size: count } }
              ])
            );
          }
        }
      }
      const arrays = await Promise.all(fetches);
      const flat = arrays.flat();
      questionsForAttempt = flat.map(q => ({
        _id: q._id,
        questionType: q.questionType || "mcq",
        subject: q.category,
        level: q.difficulty,
        questionText: q.title || "",
        questionImageUrl: q.questionImageUrl || null,
        options: Array.isArray(q.options) ? q.options.map(opt => ({ text: opt.text || "", imageUrl: opt.imageUrl || null })) : [],
        correct: q.correct || [],
        correctManualAnswer: q.correctManualAnswer || null,
        marks: q.marks || 1,
        negative: q.negative || 0,
        explanation: q.explanation || null,
        parentQuestionId: q.parentQuestionId || null,
        isPassage: !!(q.questionType === "passage" || q.isPassage),
      }));
    }

    if (!questionsForAttempt.length) {
      return res.status(400).json({ success: false, message: "No questions found for this test." });
    }

    // Optionally shuffle non-passage blocks — keep passages grouped, but if you want stable order comment this out
    // questionsForAttempt = shuffleArray(questionsForAttempt);

    // Group passages and children so passage shows once followed by its children
    const grouped = groupPassagesAndChildren(questionsForAttempt);

    // Attach parentPassage object to children (so frontend can render passage before children)
    // Build a map of passage id -> passage content
    const passageMap = {};
    grouped.forEach(q => {
      if ((q.questionType === "passage" || q.isPassage) && q._id) {
        passageMap[q._id.toString()] = {
          text: q.questionText || "",
          imageUrl: q.questionImageUrl || null,
          _id: q._id
        };
      }
    });

    // Build attempt questions payload (including parentPassage on child items)
    const attemptQuestionsForDB = grouped.map(q => {
      const isPass = q.questionType === "passage" || q.isPassage;
      const obj = {
        _id: q._id,
        questionType: q.questionType || (isPass ? "passage" : "mcq"),
        subject: q.subject,
        level: q.level,
        questionText: q.questionText || "",
        questionImageUrl: q.questionImageUrl || null,
        options: Array.isArray(q.options) ? q.options : [],
        correct: q.correct || [],
        correctManualAnswer: q.correctManualAnswer || null,
        marks: q.marks || 1,
        negative: q.negative || 0,
        explanation: q.explanation || null,
        parentQuestionId: q.parentQuestionId || null,
        isPassage: isPass
      };

      // If this item is a child (has parentQuestionId), attach parentPassage quick object
      if (obj.parentQuestionId) {
        const pid = obj.parentQuestionId.toString();
        if (passageMap[pid]) {
          obj.parentPassage = passageMap[pid];
        } else {
          // fallback: if parent not in map, try to find by parentQuestionId in grouped
          const p = grouped.find(x => x._id && x._id.toString() === pid);
          if (p) obj.parentPassage = { text: p.questionText || "", imageUrl: p.questionImageUrl || null, _id: p._id };
        }
      }

      return obj;
    });

    // Save Attempt with answers array initialized empty to avoid earlier errors
    const attemptDoc = await Attempt.create({
      studentId,
      mocktestId,
      questions: attemptQuestionsForDB,
      answers: [], // important: array
      startedAt: now,
      endsAt,
      status: "in-progress"
    });

    // Link attempt to user
    await Usermodel.findByIdAndUpdate(studentId, { $push: { attempts: attemptDoc._id } });

    // Return questions to frontend WITHOUT answers/corrects
    const safeQuestions = attemptQuestionsForDB.map(q => {
      const { correct, correctManualAnswer, explanation, ...rest } = q;
      // For passage items, keep the passage text/image (rest.questionText)
      // For child items, include parentPassage (helps frontend)
      return rest;
    });

    return res.json({ success: true, attemptId: attemptDoc._id, endsAt, questions: safeQuestions });
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
        // FIXED → Added 'thumbnail'
        select:
          "title description durationMinutes totalQuestions thumbnail categorySlug subjects isGrandTest scheduledFor"
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

    // Ensure answers is an array
    const safeAnswers = Array.isArray(attempt.answers) ? attempt.answers : [];

    // Build questions for frontend removing sensitive fields
    const questions = (attempt.questions || []).map(q => {
      const { correct, correctManualAnswer, explanation, ...rest } = q;
      return rest;
    });

    // Map minimal answers to restore frontend state
    const mappedAnswers = safeAnswers.map(a => ({
      questionId: a.questionId,
      selectedAnswer: a.selectedAnswer
    }));

    return res.json({
      _id: attempt._id,
      mocktestId: attempt.mocktestId,
      endsAt: attempt.endsAt,
      status: attempt.status,
      questions,
      answers: mappedAnswers
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

export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ studentId: req.user.id })
      .populate("mocktestId", "title totalMarks")
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (err) {
    console.error("Error fetching attempts:", err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};
