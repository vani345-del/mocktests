// backend/controllers/mockTestController.js
import mongoose from "mongoose";
import MockTest from "../models/MockTest.js";
import Category from "../models/Category.js";
import Question from "../models/Question.js";

import fs from "fs";
import csv from "csv-parser";
import xlsx from "xlsx";




const generateQuestionsForTest = async (subjects) => {
    let questionIds = [];
    let totalQuestions = 0;

    for (const subject of subjects) {
        const { name, easy, medium, hard } = subject;
        
        const difficultyMap = {
            easy: easy || 0,
            medium: medium || 0,
            hard: hard || 0
        };

        for (const [level, count] of Object.entries(difficultyMap)) {
            if (count > 0) {
                // Use MongoDB Aggregation Pipeline for efficient random selection
                const selected = await Question.aggregate([
                    {
                        $match: {
                            category: name.trim(),
                            difficulty: level,
                        }
                    },
                    { $sample: { size: count } }, // Randomly select 'count' questions
                    { $project: { _id: 1 } }
                ]);

                // Collect the IDs
                questionIds = questionIds.concat(selected.map(q => q._id));
                totalQuestions += selected.length;
            }
        }
    }

    return { questionIds, totalQuestions };
};


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
// backend/controllers/mockTestController.js (replace createMockTest)
export const createMockTest = async (req, res) => {
  try {
    let {
      category,
      subcategory = "",
      title = "",
      description = "",
      durationMinutes = 0,
      totalQuestions: formTotalQuestions,
      totalMarks = 0,
      negativeMarking = 0,
      price = 0,
      discountPrice = 0,
      isPublished = false,
      subjects = [],
      isGrandTest = false,
      scheduledFor,
    } = req.body;

    console.log("createMockTest called. incoming category:", category);

    // Validate required fields early
    if (!category) {
      return res.status(400).json({ message: "Category (slug) is required" });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Convert slug to ObjectId
    const foundCategory = await Category.findOne({ slug: category });
    if (!foundCategory) {
      return res.status(400).json({ message: "Invalid category slug" });
    }
    const categoryId = foundCategory._id; // Use this for MockTest

    // Ensure subjects is parsed
    const parsedSubjects = (
      typeof subjects === "string" ? JSON.parse(subjects) : subjects || []
    ).map((s) => ({
      name: (s.name || "").trim(),
      easy: Number(s.easy) || 0,
      medium: Number(s.medium) || 0,
      hard: Number(s.hard) || 0,
    }));

    // Generate question IDs (returns arrays, may be empty)
    const { questionIds, totalQuestions: generatedTotalQuestions } =
      await generateQuestionsForTest(parsedSubjects);

    const finalTotalQuestions = generatedTotalQuestions || 0;

    const mt = new MockTest({
      category: categoryId,
      categorySlug: foundCategory.slug,
      subcategory: String(subcategory || "").trim(),
      title: String(title).trim(),
      description: String(description || "").trim(),
      durationMinutes: Number(durationMinutes) || 0,
      totalQuestions: finalTotalQuestions,
      totalMarks: Number(totalMarks) || 0,
      negativeMarking: Number(negativeMarking) || 0,
      price: Number(price) || 0,
      discountPrice: Number(discountPrice) || 0,
      isPublished: !!isPublished,
      subjects: parsedSubjects,
      isGrandTest: !!isGrandTest,
      scheduledFor: !!isGrandTest && scheduledFor ? new Date(scheduledFor) : null,
      questionIds: questionIds || [],
    });

    await mt.save();

    // Return a consistent shape
    return res.status(201).json({ mocktest: mt });
  } catch (err) {
    console.error("createMockTest ERROR:", err);
    return res.status(500).json({ message: "Create mocktest failed", error: err.message });
  }
};

// ✅ --- THIS IS THE UPDATE FUNCTION ---
export const updateMockTest = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;

        // Convert category slug back to ObjectId before updating
        if (
            updateData.category &&
            !mongoose.Types.ObjectId.isValid(updateData.category)
        ) {
            const foundCategory = await Category.findOne({
                slug: updateData.category,
            });
            if (!foundCategory) {
                return res.status(400).json({ message: "Invalid category slug" });
            }
            updateData.category = foundCategory._id;
            updateData.categorySlug = foundCategory.slug;
        }

        // Trim strings just in case
        if (updateData.subcategory)
            updateData.subcategory = updateData.subcategory.trim();
        if (updateData.title) updateData.title = updateData.title.trim();
        if (updateData.description)
            updateData.description = updateData.description.trim();

        // Ensure subjects are parsed and trimmed
        if (updateData.subjects) {
            updateData.subjects = (
                typeof updateData.subjects === "string"
                    ? JSON.parse(updateData.subjects)
                    : updateData.subjects || []
            ).map((s) => ({
                ...s,
                name: s.name.trim(),
            }));
            
            // 🔥 CRITICAL STEP: RE-GENERATE questions if subjects structure changed
            const { questionIds, totalQuestions } = 
                await generateQuestionsForTest(updateData.subjects);
            
            updateData.questionIds = questionIds;
            updateData.totalQuestions = totalQuestions;
        }


        const updatedMockTest = await MockTest.findByIdAndUpdate(id, updateData, {
            new: true, // Return the modified document
            runValidators: true, // Run schema validators
        });

        if (!updatedMockTest) {
            return res.status(404).json({ message: "MockTest not found" });
        }

        res.status(200).json(updatedMockTest);
    } catch (err) {
        console.error("Error updating mocktest:", err);
        res
            .status(500)
            .json({ message: "Failed to update mocktest", error: err.message });
    }
};
// ✅ --- END OF UPDATE FUNCTION ---
export const submitMockTest = async (req, res) => {
    try {
        const { userId, answers } = req.body;
        const mocktest = await MockTest.findById(req.params.id);
        if (!mocktest)
            return res.status(404).json({ message: "MockTest not found" });

        // Get the list of question IDs submitted by the student
        const submittedQuestionIds = answers.map(ans => ans.questionId);

        // Fetch the corresponding questions from the global Question collection
        const questions = await Question.find({
            _id: { $in: submittedQuestionIds }
        }).select('correct correctManualAnswer marks negative');

        // Create a map for quick lookup: { 'questionId': { correct: [...], marks: X, ... } }
        const questionMap = questions.reduce((map, q) => {
            map[q._id.toString()] = q;
            return map;
        }, {});

        let totalScore = 0;
        const finalAnswers = [];

        for (const ans of answers) {
            const qDoc = questionMap[ans.questionId];

            if (qDoc) {
                let isCorrect = false;
                const questionMarks = qDoc.marks || 1;
                const negativeMarks = mocktest.negativeMarking || 0;

                if (qDoc.questionType === 'mcq') {
                    // Assuming selectedAnswer is an array of indices [0, 2] or a single index string "0"
                    const studentAnswers = Array.isArray(ans.selectedAnswer) 
                        ? ans.selectedAnswer.map(i => Number(i))
                        : (typeof ans.selectedAnswer === 'string' 
                            ? ans.selectedAnswer.split(',').map(i => Number(i.trim())) 
                            : [Number(ans.selectedAnswer)]
                        ).filter(i => !isNaN(i));

                    // Check if the student's answers exactly match the correct answers
                    const correctAnswers = qDoc.correct.map(Number);
                    
                    isCorrect = (
                        studentAnswers.length === correctAnswers.length &&
                        studentAnswers.every(val => correctAnswers.includes(val))
                    );

                } else if (qDoc.questionType === 'manual') {
                    // Simple string comparison for manual answers (can be expanded for fuzzy matching)
                    isCorrect = ans.selectedAnswer?.trim().toLowerCase() === qDoc.correctManualAnswer?.trim().toLowerCase();
                }

                if (isCorrect) {
                    totalScore += questionMarks;
                } else {
                    totalScore -= negativeMarks;
                }
                
                finalAnswers.push({
                    questionId: ans.questionId,
                    selectedAnswer: ans.selectedAnswer,
                    isCorrect: isCorrect,
                });
            }
        }

        const attempt = {
            userId,
            answers: finalAnswers,
            score: totalScore,
            submittedAt: new Date(),
        };

        mocktest.attempts.push(attempt);
        await mocktest.save();

        res
            .status(200)
            .json({ message: "Test submitted successfully", score: totalScore });
    } catch (err) {
        console.error('Error submitting test:', err);
        res
            .status(500)
            .json({ message: "Error submitting test", error: err.message });
    }
};
/* Get mocktest by id */
export const getMockTestById = async (req, res) => {
    try {
        const mocktest = await MockTest.findById(req.params.id).populate(
            "category",
            "name slug"
        );

        if (!mocktest) {
            return res.status(404).json({ message: "MockTest not found" });
        }

        // Note: The UI will need to explicitly fetch the actual questions via a different route 
        // using the mocktest.questionIds array, as this response no longer embeds questions.
        res.json(mocktest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// backend/controllers/mockTestController.js (partial - addQuestion)


export const addQuestion = async (req, res) => {
  try {
    const { id } = req.params; // mocktest id
    const {
      subject,
      level,
      questionText,
      options,
      correct,
      correctManualAnswer,
      questionType = "mcq",
      marks,
      negative,
      explanation,
      parentQuestionId // <-- optional: link to passage
    } = req.body;

    const mt = await MockTest.findById(id);
    if (!mt) return res.status(404).json({ message: "MockTest not found" });

    const files = req.files || {};
    const getFileUrl = (field) => (files[field] ? files[field][0].path.replace(/\\/g, "/") : null);

    const newQuestionData = {
      questionType,
      title: questionText?.trim(),
      difficulty: (level || "easy").toLowerCase(),
      category: subject?.trim(),
      marks: Number(marks || 1),
      negative: Number(negative || 0),
      explanation: explanation?.trim() || "",
      questionImageUrl: getFileUrl("questionImage"),
      parentQuestionId: parentQuestionId || null
    };

    if (questionType === "mcq") {
      const rawOptions = Array.isArray(options) ? options : JSON.parse(options || "[]");
      newQuestionData.options = rawOptions.map((opt, i) => ({
        text: typeof opt === "string" ? opt : (opt.text || ""),
        imageUrl: getFileUrl(`optionImage${i}`)
      }));

      newQuestionData.correct = Array.isArray(correct) ? correct.map(Number) : JSON.parse(correct || "[]").map(Number);
    } else if (questionType === "manual") {
      newQuestionData.correctManualAnswer = correctManualAnswer?.trim();
    } else if (questionType === "passage") {
      // For passage, title is the passage text, questionImageUrl may be image of passage.
      // options / correct should not be present.
      newQuestionData.options = [];
      newQuestionData.correct = [];
    }

    const qDoc = new Question(newQuestionData);
    await qDoc.save();

    // Attach to mocktest.questionIds so this question is part of the mocktest
    mt.questionIds.push(qDoc._id);
    mt.totalQuestions = mt.questionIds.length;
    mt.totalMarks = (mt.totalMarks || 0) + (qDoc.marks || 0);
    await mt.save();

    res.status(201).json({ message: "Question added successfully", questionId: qDoc._id, question: qDoc });
  } catch (err) {
    console.error("❌ Error in addQuestion:", err);
    res.status(500).json({ message: err.message });
  }
};

// ... (keep all other controller functions: bulkUploadQuestions, togglePublish, deleteMockTest, etc.) ...
// ⭐ 2. REWRITTEN BULK UPLOAD FUNCTION
export const bulkUploadQuestions = async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) throw new Error("No file uploaded");

    let parsedRows = [];
    if (filePath.endsWith(".xlsx") || filePath.endsWith(".xls")) {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      parsedRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      const csvData = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", row => csvData.push(row))
          .on("end", resolve)
          .on("error", reject);
      });
      parsedRows = csvData;
    }

    const validQuestions = [];
    const errors = [];

    for (const row of parsedRows) {
      const clean = {};
      Object.keys(row).forEach(k => {
        const kk = k.replace(/\s+/g, "").toLowerCase();
        clean[kk] = typeof row[k] === "string" ? row[k].trim() : row[k];
      });

      if (!clean.question || !clean.subject || !clean.level) {
        errors.push({ row, error: "Missing required fields" });
        continue;
      }

      const qType = clean.questiontype === "manual" ? "manual" : "mcq";
      const base = {
        questionType: qType,
        title: clean.question,
        questionImageUrl: clean.questionimageurl || null,
        category: clean.subject,
        difficulty: clean.level.toLowerCase(),
        marks: Number(clean.marks) || 1,
        negative: Number(clean.negative) || 0,
        tags: clean.tags ? clean.tags.split(",").map(t => t.trim()) : []
      };

      if (qType === "mcq") {
        const options = [
          { text: clean.optiona_text, imageUrl: clean.optiona_image },
          { text: clean.optionb_text, imageUrl: clean.optionb_image },
          { text: clean.optionc_text, imageUrl: clean.optionc_image },
          { text: clean.optiond_text, imageUrl: clean.optiond_image },
          { text: clean.optione_text, imageUrl: clean.optione_image }
        ].filter(o => o.text || o.imageUrl);

        if (options.length < 2) { errors.push({ row, error: "Not enough options" }); continue; }
        const correctIndexes = String(clean.correctindex || "").split(",").map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n));
        if (!correctIndexes.length) { errors.push({ row, error: "No correct index" }); continue; }

        base.options = options;
        base.correct = correctIndexes;
      } else {
        if (!clean.correctmanualanswer) { errors.push({ row, error: "Manual missing correctManualAnswer" }); continue; }
        base.correctManualAnswer = clean.correctmanualanswer;
      }

      validQuestions.push(base);
    }

    if (!validQuestions.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "No valid questions found", errors });
    }

    // Insert and optionally attach
    const inserted = await Question.insertMany(validQuestions);
    fs.unlinkSync(filePath);

    if (req.params?.id) {
      const ids = inserted.map(i => i._id);
      await MockTest.findByIdAndUpdate(req.params.id, { $push: { questionIds: { $each: ids } }, $inc: { totalQuestions: ids.length } });
    }

    res.status(201).json({ message: `${inserted.length} questions uploaded`, errors });
  } catch (err) {
    console.error("❌ Error bulk upload:", err);
    res.status(500).json({ message: err.message });
  }
};

/* Change publish status */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const mt = await MockTest.findByIdAndUpdate(
      id,
      { isPublished: !!isPublished },
      { new: true }
    );
    if (!mt) return res.status(404).json({ message: "Not found" });
    res.json(mt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Toggle Publish/Unpublish
export const togglePublish = async (req, res) => {
  try {
    const mocktest = await MockTest.findById(req.params.id);
    if (!mocktest)
      return res.status(404).json({ message: "MockTest not found" });

    mocktest.isPublished = !mocktest.isPublished;
    await mocktest.save();

    res.json({
      message: mocktest.isPublished
        ? "MockTest Published"
        : "MockTest Unpublished",
      mocktest,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error toggling publish status", error: err.message });
  }
};

// ✅ Delete MockTest
export const deleteMockTest = async (req, res) => {
  try {
    const deleted = await MockTest.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "MockTest not found" });
    res.json({ message: "MockTest deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting mocktest", error: err.message });
  }
};

// ✅ Get Published MockTests (for student view)
export const getPublishedMockTests = async (req, res) => {
  try {
    const tests = await MockTest.find({ isPublished: true }).select(
      "-questions.correctAnswer"
    );
    res.json(tests);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching published mocktests", error: err.message });
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
        { description: new RegExp(q, "i") },
      ];
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({
          $or: [{ slug: category }, { name: category }],
        });

        if (cat) {
          filter.category = cat._id;
        } else {
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

// backend/controllers/mockTestController.js

// (keep all other functions as-is)

// ... (your existing formatPath helper function)
const formatPath = (file) => {
  if (!file || !file.path) {
    return null;
  }
  return file.path.replace(/\\/g, '/');
}

// --- ✅ --- UPDATED CONTROLLER FUNCTION (with better logging) ---
/* Create a single question in the global pool */
export const createGlobalQuestion = async (req, res) => {
  
  // --- NEW: Log the incoming data ---
  console.log('--- createGlobalQuestion ---');
  console.log('BODY:', JSON.stringify(req.body, null, 2));
  console.log('FILES:', req.files);
  // --- End Log ---

  try {
    const {
      questionType,
      title,
      correctManualAnswer,
      marks,
      negative,
      difficulty,
      category,
      options: optionsJSON,
      correct: correctJSON,
    } = req.body;

    const files = req.files || {};

    // --- NEW: Check for required fields early ---
    if (!title) {
      return res.status(400).json({ message: 'Question text (title) is required.' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Subject (category) is required.' });
    }
    // --- End Check ---

    const questionImageUrl = files.questionImage
      ? formatPath(files.questionImage[0])
      : null;

    const newQuestionData = {
      questionType,
      title,
      marks: Number(marks) || 1,
      negative: Number(negative) || 0,
      difficulty,
      category,
      questionImageUrl: questionImageUrl,
    };

    if (questionType === 'mcq') {
      let options = JSON.parse(optionsJSON || '[]');
      let correct = JSON.parse(correctJSON || '[]');

      const finalOptions = options.map((opt, i) => {
        const fileKey = `optionImage${i}`;
        return {
          text: opt.text,
          imageUrl: files[fileKey] ? formatPath(files[fileKey][0]) : null,
        };
      });
      
      newQuestionData.options = finalOptions.filter(
        (opt) => opt.text || opt.imageUrl
      );
      newQuestionData.correct = correct;

      if (newQuestionData.options.length < 2) {
        return res
          .status(400)
          .json({ message: 'MCQ questions must have at least 2 options.' });
      }
      if (newQuestionData.correct.length === 0) {
        return res
          .status(400)
          .json({ message: 'MCQ questions must have at least 1 correct answer.' });
      }
    } else {
      if (!correctManualAnswer) {
        return res
          .status(400)
          .json({ message: 'Manual questions must have a correct answer.' });
      }
      newQuestionData.correctManualAnswer = correctManualAnswer;
    }

    const question = new Question(newQuestionData);
    await question.save();

    res.status(201).json(question);
  } catch (err) {
    // --- ✅ --- ENHANCED ERROR LOGGING ---
    console.error('--- ERROR creating global question ---');

    // Check for Mongoose Validation Errors
    if (err.name === 'ValidationError') {
      console.error('Validation Error Details:', JSON.stringify(err.errors, null, 2));
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ 
        message: 'Validation failed.', 
        errors: messages 
      });
    }

    // Log other errors
    console.error('Error Stack:', err.stack || err.message);
    
    // Clean up uploaded files on error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach(file => fs.unlink(file.path, () => {})); // Use async unlink
        }
      });
    }

    res.status(500).json({
      message: 'Failed to create question',
      error: err.stack || err.message,
    });
    // --- ✅ --- END ENHANCED LOGGING ---
  }
};
// --- ✅ --- END OF UPDATED FUNCTION ---



export const addPassageWithChildren = async (req, res) => {
  try {
    const { id } = req.params; // mocktest id

    const mt = await MockTest.findById(id);
    if (!mt) return res.status(404).json({ message: "MockTest not found" });

    // req.body fields
    const passageTitle = req.body.passageTitle?.toString() || "";
    const passageCategory = req.body.category || req.body.passageCategory || mt?.subjects?.[0]?.name || "";
    const passageDifficulty = req.body.difficulty || "medium";
    const childrenRaw = req.body.children || "[]"; // JSON string
    const children = Array.isArray(childrenRaw) ? childrenRaw : JSON.parse(childrenRaw || "[]");

    // files
    const files = req.files || []; // multer.any() yields array
    // helper to find file by fieldname
    const findFilePath = (fieldname) => {
      const f = files.find(x => x.fieldname === fieldname);
      return f ? f.path.replace(/\\/g, "/") : null;
    };

    // 1) create passage question
    const passageData = {
      questionType: "passage",
      title: passageTitle,
      questionImageUrl: findFilePath("passageImage") || null,
      difficulty: passageDifficulty,
      category: passageCategory,
      marks: 0,
      negative: 0,
      options: [],
      correct: []
    };

    const passageDoc = new Question(passageData);
    await passageDoc.save();

    // 2) create child MCQs
    const createdChildIds = [];
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      // sanitize
      const title = (c.title || "").toString();
      const options = Array.isArray(c.options) ? c.options : [];
      const marks = Number(c.marks || 1);
      const negative = Number(c.negative || 0);
      const difficulty = c.difficulty || passageDifficulty;
      const correctIndex = typeof c.correctIndex !== "undefined" ? Number(c.correctIndex) : null;

      // build options array with potential file lookups
      const opts = options.map((optText, j) => {
        const field = `child_${i}_optionImage${j}`;
        return {
          text: (optText || "").toString(),
          imageUrl: findFilePath(field)
        };
      });

      const childData = {
        questionType: "mcq",
        title,
        questionImageUrl: null,
        options: opts,
        correct: Number.isFinite(correctIndex) ? [correctIndex] : [],
        marks,
        negative,
        difficulty,
        category: passageCategory,
        parentQuestionId: passageDoc._id
      };

      const childDoc = new Question(childData);
      await childDoc.save();
      createdChildIds.push(childDoc._id);
    }

    // 3) attach passage and children to mocktest.questionIds
    const allIds = [passageDoc._id, ...createdChildIds];
    await MockTest.findByIdAndUpdate(id, { $push: { questionIds: { $each: allIds } }, $inc: { totalQuestions: allIds.length } });

    res.status(201).json({ message: "Passage and children added", passageId: passageDoc._id, childIds: createdChildIds });
  } catch (err) {
    console.error("Error in addPassageWithChildren:", err);
    res.status(500).json({ message: err.message });
  }
};
