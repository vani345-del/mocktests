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
  getFilteredMocktests
} from "../controllers/mockTestController.js";

import { isAuth } from "../middleware/isAuth.js";
import { uploadFile, uploadQuestionImages } from "../middleware/upload.js";
import { addPassageWithChildren } from "../controllers/mockTestController.js";
import { uploadAny } from "../middleware/upload.js";


const router = express.Router();

// ADMIN
router.post("/", createMockTest);

// PUBLIC: list mocktests
router.get("/filter", getFilteredMocktests);
router.get("/category", getMocktestsByCategory);
router.get("/published/list", getPublishedMockTests);

// QUESTIONS
router.post("/questions", isAuth, uploadQuestionImages, createGlobalQuestion);
//router.post("/questions/bulk-upload", isAuth, uploadFile.single("file"), bulkUploadQuestions);
router.post(
  "/:id/questions/bulk-upload",
  isAuth,
  uploadFile.single("file"),
  bulkUploadQuestions
);

// PASSAGE
router.post("/:id/questions/passage-bulk", uploadAny, addPassageWithChildren);

// STUDENT SUBMIT
router.post("/:id/submit", isAuth, submitMockTest);

// CRUD
router.post("/:id/questions", addQuestion);
router.get("/:id", getMockTestById);
router.put("/:id", updateMockTest);
router.delete("/:id", deleteMockTest);
router.put("/:id/publish", togglePublish);

/* -------------------- EXPORT ROUTER -------------------- */

export default router;
