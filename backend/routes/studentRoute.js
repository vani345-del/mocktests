import express from "express";
import {
  getAvailableMocktests,
  startMocktest,
  submitMocktest,
  getMyPurchasedTests
} from "../controllers/studentController.js";
import { isAuth } from "../middleware/isAuth.js";

const studentRouter = express.Router();

// 🧠 View all active mocktests
studentRouter.get("/mocktests", getAvailableMocktests);

// 🚀 Start a selected mocktest
studentRouter.post("/start-test/:mocktestId", startMocktest);

// 📝 Submit a completed mocktest
studentRouter.post("/submit-test/:attemptId", submitMocktest);
studentRouter.get("/my-tests", isAuth, getMyPurchasedTests);

export default studentRouter;
