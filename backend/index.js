import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRouter from "./routes/authRoute.js";
import mocktestRoutes from "./routes/mocktestRoutes.js";
import studentRoute from "./routes/studentRoute.js";
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoute from "./routes/adminRoute.js";
import publicMocktestRoutes from './routes/publicMocktestRoutes.js';
import cartRoute from "./routes/cartRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";
import adminUserRoutes from './routes/adminUserRoutes.js';

dotenv.config();
const app = express();
const port = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ❌ REMOVE THIS → app.use("/api", publicRoutes);

// Correct API Routes
app.use("/api/cart", cartRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin', adminRoute);

app.use("/api/admin/mocktests", mocktestRoutes);
app.use("/api/student", studentRoute);

// PUBLIC ENDPOINTS (used by React)
app.use('/api/public/categories', categoryRoutes);
app.use("/api/public/mocktests", publicMocktestRoutes);

app.use('/api/payment', paymentRoute);

// Default
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  connectDB();
});
