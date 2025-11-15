import express from "express";
import {
  getAvailableMocktests,
  startMocktest,
  submitMocktest,
  getMyPurchasedTests,
  getAttemptById,
  getGrandTestLeaderboard,
} from "../controllers/studentController.js";
import { isAuth } from "../middleware/isAuth.js";

const studentRouter = express.Router();

// 🧠 View all active mocktests
studentRouter.get("/mocktests", getAvailableMocktests);

// 🚀 Start a selected mocktest
studentRouter.post("/start-test/:mocktestId", isAuth, startMocktest);


// 📝 Submit a completed mocktest
studentRouter.post("/submit-test/:attemptId", submitMocktest);
studentRouter.get("/my-mocktests", isAuth, getMyPurchasedTests);
studentRouter.get("/attempt/:attemptId", isAuth, getAttemptById);

studentRouter.get('/grandtest-leaderboard/:mockTestId', isAuth, getGrandTestLeaderboard);


export default studentRouter;
