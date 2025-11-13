import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },

    avatar: {
      type: String,
      default: "",
    },

    // 🛒 Cart items
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MockTest",
      },
    ],

    // ⭐ Purchased tests (ADD THIS)
    purchasedTests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MockTest",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
