// backend/routes/mocktestRoutes.js
import express from "express";
import {
  createMockTest,
  getMockTestById,
  addQuestion,
  bulkUploadQuestions,
  updateMockTest, // ✅ 1. Import the update function
  togglePublish,
  deleteMockTest,
  getPublishedMockTests,
  submitMockTest,
  getMockTests,
  getMocktestsByCategory, // ✅ 2. Import this function
} from "../controllers/mockTestController.js";
import { uploadSingle } from "../middleware/upload.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// --- ADMIN ROUTES ---

// ✅ 3. Re-ordered routes. Specific routes MUST come before general /:id routes.

// POST /api/admin/mocktests
router.post("/", createMockTest);

// GET /api/admin/mocktests (e.g., /api/admin/mocktests?category=ssc)
router.get("/", getMocktestsByCategory);

// POST /api/admin/mocktests/questions/bulk-upload
router.post(
  "/questions/bulk-upload",
  isAuth,
  uploadSingle.single("file"),
  bulkUploadQuestions
);

// GET /api/admin/mocktests/:id
router.get("/:id", getMockTestById);

// ✅ 4. ADDED THE PUT ROUTE for updates
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