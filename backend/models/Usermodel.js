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
      select: false, // hide password by default
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
  cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MockTest", // Reference the MockTest model
      },
    ],
    // 🔒 account management
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // 📅 Timestamps for audit
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
