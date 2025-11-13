// backend/controllers/publicController.js
import Category from "../models/Category.js";
import MockTest from "../models/MockTest.js";

export const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPublicMockTests = async (req, res) => {
  try {
    const { q, category } = req.query;

    let filter = {};

    // Search
    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    // Filter by category slug (string)
    if (category) {
      filter.categorySlug = category;
    }

    // Find tests using slug filter and populate category
    const mocktests = await MockTest.find(filter)
      .populate("category", "name slug");

    const total = await MockTest.countDocuments(filter);

    res.status(200).json({ mocktests, total });

  } catch (err) {
    console.error("Error in getPublicMockTests:", err);
    res.status(500).json({ message: err.message });
  }
};
