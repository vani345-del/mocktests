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
  getMockTests,
  getMocktestsByCategory,
  createGlobalQuestion,
} from "../controllers/mockTestController.js";
// --- ✅ FIX: Import uploadQuestionImages here --
import { isAuth } from "../middleware/isAuth.js";
import { uploadFile, uploadQuestionImages } from "../middleware/upload.js";

const router = express.Router();

// --- ADMIN ROUTES ---

// Specific routes MUST come before general /:id routes.

// POST /api/admin/mocktests
router.post("/", createMockTest);

// GET /api/admin/mocktests (e.g., /api/admin/mocktests?category=ssc)
router.get("/", getMocktestsByCategory);

// POST /api/admin/mocktests/questions/bulk-upload
router.post(
  "/questions/bulk-upload",
  isAuth,
  // --- FIX: Using 'uploadFile' here as well ---
  uploadFile.single("file"),
  bulkUploadQuestions
);

// ✅ --- THIS ROUTE WILL NOW WORK ---
router.post(
  "/questions",
  isAuth,
  uploadQuestionImages, // Use the middleware you already defined!
  createGlobalQuestion // Use the new controller function
);

// GET /api/admin/mocktests/:id
router.get("/:id", getMockTestById);

// PUT /api/admin/mocktests/:id
router.put("/:id", updateMockTest);

// DELETE /api/admin/mocktests/:id
router.delete("/:id", deleteMockTest);

// PUT /api/admin/mocktests/:id/publish
router.put("/:id/publish", togglePublish);

// POST /api/admin/mocktests/:id/questions
router.post("/:id/questions", addQuestion);

// --- STUDENT ROUTES ---
router.get("/published/list", getPublishedMockTests);
router.post("/:id/submit", submitMockTest);

export default router;