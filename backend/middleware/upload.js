// backend/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

/* ----------------------------------------
   FILE STORAGE FOR CSV / XLSX / JSON
----------------------------------------- */
const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

// Validating CSV/XLSX
const docFileFilter = (req, file, cb) => {
  const allowed = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only CSV or Excel files allowed!"), false);
};

export const uploadFile = multer({
  storage: fileStorage,
  fileFilter: docFileFilter
});

/* ----------------------------------------
   IMAGE STORAGE (for MCQ + question images)
----------------------------------------- */
const imageStorage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = "uploads/images/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `img-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images allowed!"), false);
};

/* ----------------------------------------
   QUESTION (all images in one API)
----------------------------------------- */
export const uploadQuestionImages = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter
}).fields([
  { name: "questionImage", maxCount: 1 },
  { name: "optionImage0", maxCount: 1 },
  { name: "optionImage1", maxCount: 1 },
  { name: "optionImage2", maxCount: 1 },
  { name: "optionImage3", maxCount: 1 },
  { name: "optionImage4", maxCount: 1 },
]);

/* ----------------------------------------
   SINGLE IMAGE (e.g., category image)
----------------------------------------- */
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter
});
