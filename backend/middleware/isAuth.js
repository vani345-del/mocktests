import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId; // attach userId
    next();
  } catch (error) {
    console.log("isAuth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuth;
