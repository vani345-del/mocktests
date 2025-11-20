import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, BookOpen, Users, ShoppingCart, Wallet } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";

const MockTestCard = ({ test }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData } = useSelector((state) => state.user);

  // We keep the logic for identifying the test type
  const isGrand = test.type === "Grand";
  
  // Define simple accent colors for visual distinction (using Tailwind defaults)
  const accentColor = isGrand ? "text-indigo-400" : "text-cyan-400";
  const accentButton = isGrand ? "bg-indigo-600 hover:bg-indigo-500" : "bg-cyan-600 hover:bg-cyan-500";

  const students = (test.questions * 37) + 500;

  /* ---------------- ADD TO CART ---------------- */
  const handleAddToCart = () => {
    // Console log added for debugging clicks
    console.log("Button: Add to Cart clicked"); 
    if (!userData) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    dispatch(addItemToCart(test._id));
  };

  /* ---------------- BUY NOW ---------------- */
  const handleBuyNow = () => {
    // Console log added for debugging clicks
    console.log("Button: Buy Now clicked");
    if (!userData) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    navigate(`/mocktests/${test._id}`);
  };

  return (
    // Minimal card container with dark background and shadow
    <div className="flex flex-col p-5 bg-gray-800 rounded-xl shadow-lg border border-gray-700 max-w-sm mx-auto">

      {/* Title Section */}
      <div className="mb-4 pb-3 border-b border-gray-700">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {test.category?.name?.toUpperCase() || 'CATEGORY'}
        </p>
        <h3 className="text-xl font-bold text-gray-200 line-clamp-2">
          {test.title}
        </h3>
        <p className={`text-sm font-medium ${accentColor} mt-1`}>
          {isGrand ? "All-India Grand Test" : "Premium Mock Test"}
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-5 line-clamp-3 flex-grow">
        {test.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 py-4 mb-5 border-y border-gray-700">
        <StatItem icon={Clock} value={`${test.duration} Min`} label="Duration" accentColor={accentColor} />
        <StatItem icon={BookOpen} value={`${test.questions} Qs`} label="Questions" accentColor={accentColor} />
        <StatItem icon={Users} value={students.toLocaleString()} label="Enrolled" accentColor={accentColor} />
      </div>

      {/* Pricing */}
      <p className="text-3xl font-extrabold text-gray-100 mb-5">
        ₹{test.price}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-auto w-full">
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          className={`flex items-center justify-center gap-2 w-full text-white py-3 rounded-lg font-bold transition ${accentButton}`}
        >
          <Wallet size={18} />
          Buy Now
        </button>
      </div>
    </div>
  );
};

// Helper component for clean stat display
const StatItem = ({ icon: Icon, value, label, accentColor }) => (
    <div className="text-center">
        <Icon size={18} className={`${accentColor} mx-auto mb-1`} />
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
);

export default MockTestCard;