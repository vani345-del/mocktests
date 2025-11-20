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
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      amount,
    } = req.body;

    const userId = req.user.id;

    // 1️⃣ Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 2️⃣ Ensure user exists
    const user = await Usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ Convert IDs
    const mockTestObjectIds = cartItems.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // 4️⃣ Create order record
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

    // 5️⃣ Add purchased mocktests to user (NO duplicates)
    await Usermodel.findByIdAndUpdate(userId, {
      $addToSet: { purchasedTests: { $each: mockTestObjectIds } },
      $set: { cart: [] },
    });

    // 6️⃣ Fetch updated user
    const updatedUser = await Usermodel.findById(userId).populate(
      "purchasedTests"
    );

    // 7️⃣ Success response
    res.json({
      success: true,
      message: "Payment successful & mock tests added",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during payment verification",
    });
  }
};

// -------------------------------------------------------------
// GET PAYMENT HISTORY (ADMIN)
// -------------------------------------------------------------
export const getPaymentHistory = async (req, res) => {
  try {
    // Fetch all orders, populating user details and purchased item details
    const orders = await Order.find({})
      .populate({
        path: 'user',
        select: 'name email', // Get student name and email
      })
      .populate({
        path: 'items',
        select: 'title', // Get mock test title(s)
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Format the data for the frontend table and KPI calculations
    const formattedPayments = orders.map(order => {
      // Concatenate all purchased mock test titles
      const courseName = order.items.length > 0 
        ? order.items.map(item => item.title).join(', ') 
        : 'N/A';
      
      // Map "successful" to "success" to match frontend badge logic
      const status = order.status === "successful" ? "success" : order.status; 
      
      return {
        _id: order._id,
        // Handle cases where a user might have been deleted but order still exists
        studentName: order.user ? order.user.name : 'User Deleted', 
        email: order.user ? order.user.email : 'N/A',
        courseName: courseName,
        amount: order.amount,
        date: order.createdAt,
        orderId: order.razorpay?.order_id || 'N/A',
        paymentId: order.razorpay?.payment_id || 'N/A',
        status: status,
        method: 'Razorpay' // Assuming all payments are via Razorpay for simplicity
      };
    });

    res.status(200).json(formattedPayments);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during fetching payment history",
    });
  }
};