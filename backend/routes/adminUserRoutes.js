import express from "express";
import { addInstructor, getAllInstructors,getAllStudents } from "../controllers/UserConrollers.js";
// You might want to add admin-only middleware here later
// import { isAuth, isAdmin } from "../middleware/isAuth.js"; 

const router = express.Router();

// Get all users with role 'instructor'
// We'll assume an admin-check middleware is applied before this route is mounted
router.get("/instructors", getAllInstructors);
router.post("/instructors", addInstructor);



// --- 👇 NEW STUDENT ROUTE ---
router.get("/students", getAllStudents);

export default router;