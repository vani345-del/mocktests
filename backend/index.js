import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import publicRoutes from "./routes/publicRoutes.js";
import fs from "fs";

// --- NEW: Imports for path and fileURLToPath ---
import path from "path";
import { fileURLToPath } from "url";

// ✅ Import routes
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
const port = process.env.PORT ;

// --- NEW: Setup __dirname for ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ✅ Middleware setup
app.use(
  cors({
    origin: "http://localhost:5173", // or your frontend URL
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);

// --- UPDATED: Statically serve the 'uploads' directory ---
// This now correctly serves both /uploads and /uploads/images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
app.use("/api", publicRoutes);

app.use("/api/cart", cartRoute);

app.use("/api/v1/dashboard", dashboardRoute);
app.use('/api/admin', adminUserRoutes);

// ✅ API Routes
app.use("/api/admin/mocktests", mocktestRoutes);
app.use("/api/student", studentRoute);
app.use('/api/public/categories', categoryRoutes);
app.use('/api/admin/categories', adminRoute);
app.use("/api/public/mocktests", publicMocktestRoutes);

app.use('/api/payment', paymentRoute);




// ✅ Default route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ Start server and connect DB
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  connectDB();
});