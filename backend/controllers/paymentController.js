import Razorpay from "razorpay";
import crypto from "crypto";
import Usermodel from "../models/Usermodel.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -------------------------------------------------------------
// CREATE ORDER
// -------------------------------------------------------------
export const createOrder = async (req, res) => {
  try {
    const { amount, cartItems } = req.body;
    const userId = req.user.id;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        cartItems: JSON.stringify(cartItems.map((item) => item._id)),
      },
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error creating Razorpay order");
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send(error.message);
  }
};

// -------------------------------------------------------------
// VERIFY PAYMENT
// -------------------------------------------------------------
export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    cartItems,
    amount,
  } = req.body;

  const userId = req.user.id;

  try {
    // 1. Verify the signature
    const shasum = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    );
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // 2. Get the user
    const user = await Usermodel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 3. Convert IDs
    const mockTestObjectIds = cartItems.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // 4. Save order in DB
    const newOrder = new Order({
      user: userId,
      items: mockTestObjectIds,
      amount: amount,
      razorpay: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
      },
      status: "successful",
    });

    await newOrder.save();

    // 5. Update the user
    user.purchasedTests.push(...mockTestObjectIds);
    user.cart = [];
    await user.save();

    // 6. Success
    res.json({
      success: true,
      message: "Payment successful, Mock Tests added to your dashboard!",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message:
        "Internal Server Error. Payment succeeded but updating user failed. Contact support.",
    });
  }
};
