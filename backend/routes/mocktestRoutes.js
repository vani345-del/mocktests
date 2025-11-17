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
} from "../controllers/mockTestController.js";
// --- FIX: Renamed 'uploadSingle' to 'uploadFile' to match the middleware export ---
import { uploadFile } from "../middleware/upload.js";
import { isAuth } from "../middleware/isAuth.js";

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