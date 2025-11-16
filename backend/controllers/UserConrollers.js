import genToken from "../config/token.js";
import User from '../models/Usermodel.js'
import validator from "validator";
import bcrypt from "bcryptjs";



export const signup = async(req, res) => {
    try {
        const {name,email,password,role } = req.body;
        let existUser=await User.findOne({email});
        if(existUser){
            return res.status(400).json({message:"User already exist"});

        }
        if(!validator.isEmail(email)){
            return res.status(400).json({message:"Enter a valid email"});
        }
        if(password.length<8){
            return res.status(400).json({message:"Password must be at least 8 characters long"});
        }
        let hashPassword=await bcrypt.hash(password,10);
        const user=await User.create({name,email,password:hashPassword,role});
        let token=await genToken(user._id);
       res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // required even on localhost
  sameSite: "none",    // required for cross-site cookies
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

        return res.status(201).json(user);
    }
    catch (error) {
        return res.status(500).json({message:`Sign up error ${error.message}`});
    }
};


//login system

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
   

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
     // ✅ include password
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.password) {
      return res.status(400).json({ message: "User has no password stored" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = await genToken(user._id);

  res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // required even on localhost
  sameSite: "none",    // required for cross-site cookies
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    // don’t send the password back
    const { password: _, ...userWithoutPassword } = user.toObject();
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: `Login Error: ${error.message}` });
  }
};

export const logout = async (req, res) => {
    try {
        await res.clearCookie("token");
        return res.status(200).json({message:"Logout successful"});
    } catch (error) {
        return res.status(500).json({message:`Logout error ${error}`});
    }
}


export const getme = async (req, res) => {
  try {
    const user = await Usermodel.findById(req.user.id)
      .select("-password")
      .populate("purchasedTests")
      // --- 👇 ADD THIS LINE ---
      .populate("attempts"); 
      // --- 👆 END OF ADDED LINE ---

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// --- 👇 NEW FUNCTION: Add a new instructor (by admin) ---
export const addInstructor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check for existing user
    let existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create user
    let hashPassword = await bcrypt.hash(password, 10);
    const newInstructor = await User.create({
      name,
      email,
      password: hashPassword,
      role: 'instructor' // Hardcode role
    });

    // Don't send password back
    const { password: _, ...instructorData } = newInstructor.toObject();

    return res.status(201).json({ 
      message: "Instructor added successfully", 
      instructor: instructorData 
    });

  } catch (error) {
    return res.status(500).json({ message: `Add instructor error: ${error.message}` });
  }
};


export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.aggregate([
      { $match: { role: 'student' } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          createdAt: 1,
          // Add a new field 'purchasedTestCount' by getting the size of the 'purchasedTests' array
          purchasedTestCount: { $size: { $ifNull: ["$purchasedTests", []] } }
        }
      }
    ]);
    
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

