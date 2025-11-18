// backend/routes/mocktestRoutes.js
import express from "express";
import {
  createMockTest,
  getMockTestById,
  addQuestion,
  bulkUploadQuestions,
  updateMockTest,
  togglePublish,
  deleteMockTest,
  getPublishedMockTests,
  submitMockTest,
  getMocktestsByCategory,
  createGlobalQuestion,
} from "../controllers/mockTestController.js";

import { isAuth } from "../middleware/isAuth.js";
import { uploadFile, uploadQuestionImages } from "../middleware/upload.js";
import { addPassageWithChildren } from "../controllers/mockTestController.js";
import { uploadAny } from "../middleware/upload.js";


const router = express.Router();

/* ===========================================================
   FIXED ROUTE ORDER (MOST IMPORTANT PART)
   1️⃣ Static & specific routes first
   2️⃣ Then upload routes
   3️⃣ Then global question routes
   4️⃣ Dynamic :id routes ALWAYS LAST
=========================================================== */

/* -------------------- PUBLIC + STATIC ROUTES -------------------- */

// Create mocktest (admin)
router.post("/", createMockTest);

// Fetch mocktests by category
router.get("/", getMocktestsByCategory);

// Get published mocktests (student)
router.get("/published/list", getPublishedMockTests);


/* -------------------- QUESTION UPLOAD ROUTES (Fixed) -------------------- */

// 🔥 Global question (manual or MCQ)
router.post(
  "/questions",
  isAuth,
  uploadQuestionImages,
  createGlobalQuestion
);

// 🔥 Bulk upload (CSV / XLSX)
router.post(
  "/questions/bulk-upload",
  isAuth,
  uploadFile.single("file"),
  bulkUploadQuestions
);

// Add passage with multiple child questions
router.post(
  "/:id/questions/passage-bulk",
  uploadAny,
  addPassageWithChildren
);


/* -------------------- DYNAMIC ROUTES (MUST ALWAYS BE LAST) -------------------- */

// Student submits a mock test
router.post("/:id/submit", submitMockTest);

// Add question *directly* to this mocktest
router.post("/:id/questions", addQuestion);

// Get mocktest by ID
router.get("/:id", getMockTestById);

// Update mocktest
router.put("/:id", updateMockTest);

// Delete mocktest
router.delete("/:id", deleteMockTest);

// Toggle publish/unpublish
router.put("/:id/publish", togglePublish);


/* -------------------- EXPORT ROUTER -------------------- */

export default router;
