import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// @route   POST /api/payment/create-order
// @desc    Create a new Razorpay order
// @access  Private
router.post("/create-order", isAuth, createOrder);

// @route   POST /api/payment/verify-payment
// @desc    Verify Razorpay payment and update user purchases
// @access  Private
router.post("/verify-payment", isAuth, verifyPayment);

export default router;
