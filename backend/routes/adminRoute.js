import express from "express";
import { createCategory } from "../controllers/addCatAdmin.js";
//import { uploadFile } from "../middleware/upload.js"; //
import { uploadImage } from '../middleware/upload.js';
 // ✅ Correct import

const router = express.Router();


router.post('/upload-image', (req, res) => {
  // Assuming you have an 'isAdmin' middleware protecting this route
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Return the public-facing URL of the uploaded file
    // We replace 'uploads' with '/uploads' to make it a root-relative URL
    // Make sure your Express server serves the 'uploads' directory statically!
    // In your index.js: app.use('/uploads', express.static('uploads'));
    const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`; // Make it a URL
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      imageUrl: fileUrl 
    });
  });
});
// ✅ Route for adding a category

router.post("/", uploadImage.single("image"), createCategory);

export default router; // ✅ Correct export
