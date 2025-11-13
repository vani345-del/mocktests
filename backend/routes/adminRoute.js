import express from "express";
import { createCategory } from "../controllers/addCatAdmin.js";
import { uploadSingle } from "../middleware/upload.js"; //
 // ✅ Correct import

const router = express.Router();

// ✅ Route for adding a category

router.post("/", uploadSingle.single("image"), createCategory);

export default router; // ✅ Correct export
