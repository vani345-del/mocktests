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

