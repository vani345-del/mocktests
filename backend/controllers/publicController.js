// controllers/publicController.js
import MockTest from "../models/MockTest.js";

// LIST published tests
export const getPublicMockTests = async (req, res) => {
  try {
    const { q, category } = req.query;

    let filter = { isPublished: true };

    // 🔍 Search by title
    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    // 🔥 FILTER BY CATEGORY (_id)
    if (category) {
      filter.category = category;
    }

    const mocktests = await MockTest.find(filter)
  .select("thumbnail title description durationMinutes totalQuestions price isFree isGrandTest category")
  .populate("category", "name slug");


    return res.status(200).json(mocktests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPublicMockTestById = async (req, res) => {
  try {
    const mock = await MockTest.findOne({
      _id: req.params.id,
      isPublished: true
    })
      .select(
        "title description durationMinutes totalQuestions totalMarks " +
        "isGrandTest isFree thumbnail price category subjects questionIds"
      )
      .populate("category", "name slug");

    if (!mock) return res.status(404).json({ message: "Mock test not found" });

    return res.status(200).json(mock);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
