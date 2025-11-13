

// ✅ Create Category Controller
import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    // ✅ Get image path from multer
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newCat = await Category.create({
      name,
      slug,
      image: imagePath,
    });

    res.status(201).json({
      message: "Category created successfully",
      category: newCat,
    });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: "Server error" });
  }
};
