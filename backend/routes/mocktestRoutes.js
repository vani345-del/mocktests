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
  getFilteredMocktests,
  getPassagesByCategory
} from "../controllers/mockTestController.js";

import { isAuth } from "../middleware/isAuth.js";

// ⭐ ADD MISSING IMPORT HERE
import { 
  uploadFile, 
  uploadQuestionImages, 
  uploadImage,          // <-- FIXED
  uploadAny 
} from "../middleware/upload.js";

import { addPassageWithChildren } from "../controllers/mockTestController.js";

const router = express.Router();

/* -------------------- ADMIN -------------------- */
router.post("/", uploadImage.single("thumbnail"), createMockTest);

/* -------------------- PUBLIC LIST -------------------- */
router.get("/filter", getFilteredMocktests);
router.get("/category", getMocktestsByCategory);
router.get("/published/list", getPublishedMockTests);
router.get(
  "/categories/questions/passages",
  getPassagesByCategory
);

/* -------------------- QUESTIONS -------------------- */
router.post("/questions", isAuth, uploadQuestionImages, createGlobalQuestion);

router.post(
  "/:id/questions/bulk-upload",
  isAuth,
  uploadFile.single("file"),
  bulkUploadQuestions
);

/* -------------------- PASSAGE -------------------- */
router.post("/:id/questions/passage-bulk", uploadAny, addPassageWithChildren);

/* -------------------- STUDENT SUBMIT -------------------- */
router.post("/:id/submit", isAuth, submitMockTest);

/* -------------------- CRUD -------------------- */
router.post("/:id/questions", addQuestion);
router.get("/:id", getMockTestById);
router.put("/:id", uploadAny, updateMockTest);

router.delete("/:id", deleteMockTest);
router.put("/:id/publish", togglePublish);

/* -------------------- EXPORT -------------------- */
export default router;
