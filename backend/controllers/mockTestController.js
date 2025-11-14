import mongoose from "mongoose";
import MockTest from "../models/MockTest.js";
import Category from "../models/Category.js";
import Question from "../models/Question.js";

import fs from "fs";
import csv from "csv-parser";
import xlsx from "xlsx";





export const getMocktestsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    console.log("getMocktestsByCategory called. query:", req.query);

    // No category => return all tests
    if (!category) {
      const allTests = await MockTest.find().sort({ createdAt: -1 });
      return res.json(allTests);
    }

    let filter = {};

    // If category looks like a valid ObjectId -> use it directly
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      // Try to find by slug or name
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
      });

      if (catDoc) {
        console.log("Category found by slug/name:", catDoc._id);
        filter.category = catDoc._id;
      } else {
        // IMPORTANT: if no Category doc found, use categorySlug (string match)
        // Do NOT set filter.category = category (that causes CastError).
        console.log("No category doc found — using categorySlug string match.");
        filter.categorySlug = category;
      }
    }

    const mocktests = await MockTest.find(filter).sort({ createdAt: -1 });
    console.log("Found", mocktests.length, "mocktests for filter:", filter);
    res.json(mocktests);
  } catch (err) {
    console.error("Error fetching mocktests by category:", err);
    res.status(500).json({ message: err.message });
  }
};

/* Create mocktest (Stage 1) */

export const createMockTest = async (req, res) => {
  try {
    let {
      category, subcategory, title, description,
      durationMinutes, totalQuestions, totalMarks,
      negativeMarking, price, discountPrice, isPublished,
      subjects
    } = req.body;

    // Convert slug to ObjectId
    const foundCategory = await Category.findOne({ slug: category });
    if (!foundCategory) {
      return res.status(400).json({ message: "Invalid category slug" });
    }

    // Replace slug with ObjectId
    category = foundCategory._id;

    // subjects expected as JSON string from form — parse if needed
    const parsedSubjects = typeof subjects === "string"
      ? JSON.parse(subjects)
      : subjects || [];

    const mt = new MockTest({
      category,
      subcategory,
      title,
      description,
      durationMinutes,
      totalQuestions,
      totalMarks,
      negativeMarking,
      price,
      discountPrice,
      isPublished: !!isPublished,
      subjects: parsedSubjects,
    });

    await mt.save();

    res.status(201).json(mt);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create mocktest failed", error: err.message });
  }
};
/* Get mocktest by id */


/* Add single question */
export const addQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject, level, questionText, options, correctAnswer, marks, negativeMarks, explanation
    } = req.body;

    const mt = await MockTest.findById(id);
    if (!mt) return res.status(404).json({ message: "MockTest not found" });

    const q = {
      subject, level, questionText,
      options: Array.isArray(options) ? options : JSON.parse(options),
      correctAnswer, marks: Number(marks || 1), negativeMarks: Number(negativeMarks || 0), explanation
    };

    mt.questions.push(q);

    // optional: recalc totals
    mt.totalQuestions = mt.questions.length;
    mt.totalMarks = mt.questions.reduce((s, qq) => s + (qq.marks || 1), 0);

    await mt.save();
    res.status(201).json({ message: "Question added", question: mt.questions[mt.questions.length - 1] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// ... (keep all your other functions like getMocktestsByCategory, createMockTest, etc.) ...


// ⭐ 2. REWRITTEN BULK UPLOAD FUNCTION
export const bulkUploadQuestions = async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) throw new Error("No file uploaded");

    let parsedRows = [];

    // Helper to convert "Option A", "Option B" etc. to an index
    const answerToIndex = (answer) => {
      const options = ["optiona", "optionb", "optionc", "optiond"];
      // Normalize the answer from the CSV to match our keys
      const cleanAnswer = (answer || "").replace(/\s+/g, "").toLowerCase();
      
      const index = options.indexOf(cleanAnswer);
      
      // Also check if the answer is "A", "B", "C", "D"
      if (index === -1 && cleanAnswer.length === 1) {
        return cleanAnswer.charCodeAt(0) - 'a'.charCodeAt(0);
      }
      
      // Or if the answer from the CSV *is* the option text (e.g. "Option A")
      // This is less reliable but a good fallback.
      // We will handle this inside the row mapping.
      return index;
    };

    if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls")) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      parsedRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (filePath.endsWith(".csv")) {
      const csvData = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => csvData.push(row))
          .on("end", resolve)
          .on("error", reject);
      });
      parsedRows = csvData;
    }

    const validQuestions = [];
    const errors = [];

    for (const row of parsedRows) {
      const clean = {};
      Object.keys(row).forEach((key) => {
        clean[key.replace(/\s+/g, "").toLowerCase()] = row[key];
      });

      const options = [
        clean.optiona,
        clean.optionb,
        clean.optionc,
        clean.optiond,
      ].filter(Boolean);
      
      if (!clean.question || !clean.subject || !clean.level || !clean.correctanswer || options.length < 2) {
        errors.push({ row: row, error: "Missing required fields (Question, Subject, Level, CorrectAnswer, or Options)" });
        continue;
      }
      
      // Find the index of the correct answer
      const correctIndex = options.findIndex(opt => opt === clean.correctanswer);

      if (correctIndex === -1) {
         errors.push({ row: row, error: `CorrectAnswer "${clean.correctanswer}" did not match any of the Option texts.` });
         continue;
      }
      
      validQuestions.push({
        title: clean.question,
        options: options,
        correct: [correctIndex], // Save the index, not the text
        marks: Number(clean.marks) || 1,
        negative: Number(clean.negative) || 0, // Add this if you have a 'Negative' column
        difficulty: clean.level.toLowerCase(),
        category: clean.subject, // 'category' on Question model maps to 'Subject' in CSV
        tags: [],
      });
    }

    if (!validQuestions.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: "No valid questions found in file.", 
        errors: errors,
        firstParsedRow: parsedRows[0] 
      });
    }

    // Insert new questions into the global Question collection
    await Question.insertMany(validQuestions);

    fs.unlinkSync(filePath);

    res.status(201).json({
      message: `${validQuestions.length} valid questions uploaded successfully to the global pool.`,
      errors: errors
    });
  } catch (err) {
    console.error("Error bulk upload:", err);
    res.status(500).json({
      message: "Error uploading questions",
      error: err.stack || err.message,
    });
  }
};

/* Change publish status */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const mt = await MockTest.findByIdAndUpdate(id, { isPublished: !!isPublished }, { new: true });
    if (!mt) return res.status(404).json({ message: "Not found" });
    res.json(mt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// controllers/mockTestController.j

// ✅ Toggle Publish/Unpublish
export const togglePublish = async (req, res) => {
  try {
    const mocktest = await MockTest.findById(req.params.id);
    if (!mocktest) return res.status(404).json({ message: "MockTest not found" });

    mocktest.isPublished = !mocktest.isPublished;
    await mocktest.save();

    res.json({
      message: mocktest.isPublished ? "MockTest Published" : "MockTest Unpublished",
      mocktest,
    });
  } catch (err) {
    res.status(500).json({ message: "Error toggling publish status", error: err.message });
  }
};

// ✅ Delete MockTest
export const deleteMockTest = async (req, res) => {
  try {
    const deleted = await MockTest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "MockTest not found" });
    res.json({ message: "MockTest deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting mocktest", error: err.message });
  }
};

// ✅ Get Published MockTests (for student view)
export const getPublishedMockTests = async (req, res) => {
  try {
    const tests = await MockTest.find({ isPublished: true }).select("-questions.correctAnswer");
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching published mocktests", error: err.message });
  }
};

// ✅ Submit Test (Student)
export const submitMockTest = async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const mocktest = await MockTest.findById(req.params.id);
    if (!mocktest) return res.status(404).json({ message: "MockTest not found" });

    let totalScore = 0;
    answers.forEach((ans) => {
      const q = mocktest.questions.id(ans.questionId);
      if (q) {
        const correct = q.correctAnswer === ans.selectedAnswer;
        ans.isCorrect = correct;
        if (correct) totalScore += q.marks || 1;
        else totalScore -= mocktest.negativeMarking || 0;
      }
    });

    const attempt = {
      userId,
      answers,
      score: totalScore,
      submittedAt: new Date(),
    };

    mocktest.attempts.push(attempt);
    await mocktest.save();

    res.status(200).json({ message: "Test submitted successfully", score: totalScore });
  } catch (err) {
    res.status(500).json({ message: "Error submitting test", error: err.message });
  }
};

export const getMockTests = async (req, res) => {
  try {
    const { q, category, limit = 50 } = req.query;
    const filter = {};

    filter.isPublished = true;

    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") }
      ];
    }

    if (category) {

      // 🟢 If category is ObjectId → use it
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;

      } else {
        // 🟢 Otherwise match by slug or name ONLY
        const cat = await Category.findOne({
          $or: [{ slug: category }, { name: category }],
        });

        if (cat) {
          filter.category = cat._id;
        } else {
          // 🟢 FINAL fallback: use categorySlug = "ssc"
          filter.categorySlug = category;
        }
      }
    }

    const mocktests = await MockTest.find(filter)
      .populate("category", "name slug")
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await MockTest.countDocuments(filter);

    return res.json({ mocktests, total });

  } catch (err) {
    console.error("getMockTests ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMockTestById = async (req, res) => {
  try {
    const mocktest = await MockTest.findById(req.params.id)
      .populate("category", "name slug");

    if (!mocktest) {
      return res.status(404).json({ message: "MockTest not found" });
    }

    res.json(mocktest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
