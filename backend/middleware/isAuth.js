import jwt from 'jsonwebtoken';
import User from '../models/Usermodel.js';

export const isAuth = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. No token provided.' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- ⭐ HERE IS THE FIX ⭐ ---
    // Check for 'id' (from my previous code) OR '_id' (which is common from login controllers)
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload. No "id" or "_id" found.' });
    }
    // -------------------------

    // 3. Find user
    const user = await User.findById(userId).select('_id');
    
    if (!user) {
        // This is the error you are seeing
        return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    // 4. Attach the user's ID to the request object
    req.user = {
      id: user._id.toString() 
    };

    next();
  } catch (error) {
    console.error('AUTH_MIDDLEWARE_ERROR:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
       return res.status(401).json({ message: 'Not authenticated. Token is invalid or malformed.'});
    }
    if (error.name === 'TokenExpiredError') {
       return res.status(401).json({ message: 'Not authenticated. Token has expired.'});
    }
    
    // Handle other errors
    return res.status(500).json({ message: 'Authentication middleware error.', error: error.message });
  }
};