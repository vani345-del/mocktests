// routes/publicMocktestRoutes.js
import express from "express";
import { getMockTests, getMockTestById } from "../controllers/mockTestController.js";

const router = express.Router();

// GET /api/public/mocktests?q=...&category=...&limit=4
router.get("/", getMockTests);

// GET /api/public/mocktests/:id
router.get("/:id", getMockTestById);

export default router;
