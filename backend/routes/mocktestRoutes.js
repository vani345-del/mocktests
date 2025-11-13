// routes/adminMocktests.js
import express from "express";
import {
  createMockTest, getMockTestById, addQuestion, bulkUploadQuestions, updateStatus, getMocktestsByCategory,
   togglePublish,
  deleteMockTest,
  getPublishedMockTests,
  submitMockTest,
  getMockTests,
} from "../controllers/mockTestController.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

// POST /api/admin/mocktests
router.post("/", createMockTest);

router.get("/", getMocktestsByCategory); 
// GET /api/admin/mocktests/:id
router.get("/:id", getMockTestById);

// Add single question
router.post("/:id/questions", addQuestion);

// Bulk upload (file field name = 'file')
router.post("/:id/questions/bulk", uploadSingle.single("file"), bulkUploadQuestions);

// Update status publish/unpublish
router.put("/:id/status", updateStatus);
router.put("/:id/status", updateStatus);
router.put("/:id/publish", togglePublish);
router.delete("/:id", deleteMockTest);

// Student Routes
router.get("/published/list", getPublishedMockTests);
router.post("/:id/submit", submitMockTest);

router.get('/', getMockTests);
router.get('/:id', getMockTestById);

export default router;
