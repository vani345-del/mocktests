import express from "express";
import {
  getAvailableMocktests,
  startMocktest,
  submitMocktest,
} from "../controllers/studentController.js";

const studentRouter = express.Router();

// 🧠 View all active mocktests
studentRouter.get("/mocktests", getAvailableMocktests);

// 🚀 Start a selected mocktest
studentRouter.post("/start-test/:mocktestId", startMocktest);

// 📝 Submit a completed mocktest
studentRouter.post("/submit-test/:attemptId", submitMocktest);

export default studentRouter;
