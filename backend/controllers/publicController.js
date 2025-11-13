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
    const q = req.query.q;
    let filter = {};

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    const mocktests = await MockTest.find(filter).populate("category,name slug");
    res.status(200).json({ mocktests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
