import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/create-order", isAuth, createOrder);
router.post("/verify-payment", isAuth, verifyPayment);

export default router;
