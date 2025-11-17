// backend/middleware/upload.js
import multer from "multer";
import path from "path";

// --- Storage for CSV/XLSX etc. ---
const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // Main uploads directory
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

// --- Storage engine specifically for images ---
const imageStorage = multer.diskStorage({
  destination(req, file, cb) {
    // --- Create the directory if it doesn't exist ---
    const dir = "uploads/images/";
    // This check is good practice, though 'uploads/' should exist
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `img-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

// --- Filter to only allow image files ---
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// --- Export for single CSV/XLSX files ---
export const uploadFile = multer({ storage: fileStorage });

// --- UPDATED: Export for our question form fields ---
// This will handle a mix of image fields
export const uploadQuestionImages = multer({ 
  storage: imageStorage, 
  fileFilter: imageFileFilter 
}).fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'optionImage0', maxCount: 1 },
  { name: 'optionImage1', maxCount: 1 },
  { name: 'optionImage2', maxCount: 1 },
  { name: 'optionImage3', maxCount: 1 },
  { name: 'optionImage4', maxCount: 1 } // Added 5th option just in case
]);

// --- Export for single image (like for Category) ---
export const uploadImage = multer({ 
  storage: imageStorage, 
  fileFilter: imageFileFilter 
});