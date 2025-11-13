import User from "../models/Usermodel.js";
import MockTest from "../models/MockTest.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart',
      model: 'MockTest',
      select: 'title price discountPrice imageUrl categorySlug' // Select fields you want to show in cart
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { mocktestId } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated, req.user not found.' });
    }
    const userId = req.user.id;
     

    // Check if test exists
    const test = await MockTest.findById(mocktestId);
    if (!test) {
      return res.status(404).json({ message: "Mock test not found" });
    }

   const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { cart: mocktestId } }, // $addToSet prevents duplicates
      { new: true }
    ).populate({
      path: 'cart',
      model: 'MockTest',
      select: 'title price discountPrice imageUrl categorySlug'
    });
    res.json(user.cart);
  } 
  catch (error) {
    // --- THIS IS THE CRITICAL FIX ---
    console.error("❌ ADD_TO_CART_ERROR:", error); // Log the full error to your backend terminal
    res.status(500).json({ 
      message: "Server error while adding to cart.", 
      error: error.message, // Send the specific error message back to the frontend
      fullError: error // (Optional: send full error in development)
    });
    // ---------------------------------
  }




};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:mocktestId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { mocktestId } = req.params;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: mocktestId } }, // $pull removes the item
      { new: true }
    ).populate({
      path: 'cart',
      model: 'MockTest',
      select: 'title price discountPrice imageUrl categorySlug'
    });

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};