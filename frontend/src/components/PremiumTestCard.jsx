// src/components/PremiumTestCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Clock, BookOpen, Users, Rocket, ShoppingCart, Eye } from "lucide-react";
import { useSelector } from "react-redux";

export default function PremiumTestCard({ test, onAddToCart, pageContext }) {
  const { items: cartItems } = useSelector((state) => state.cart || { items: [] });
  const isAlreadyInCart = cartItems.some((item) => item._id === test._id);

  const isPurchased = test?.isPurchased || false;
  const isFree = test?.price === 0;

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(test);
  };

  const showDual = pageContext === "catalog" && !isPurchased && !isFree;

  return (
    <div className="rounded-2xl bg-gray-900 text-white shadow-lg p-4 hover:scale-[1.02] transition">
      <div className="bg-indigo-500 text-white py-2 px-4 rounded-xl mb-4 font-bold flex justify-between">
        <span>{test.type === "Grand" ? "Grand Test" : "Premium Test"}</span>
        <Rocket className="w-4 h-4" />
      </div>

      <Link to={`/mocktests/${test._id}`} className="block">
        <h3 className="text-xl font-bold mb-2">{test.title}</h3>
        <p className="text-gray-400 mb-3 line-clamp-2">{test.description}</p>

        <div className="grid grid-cols-3 gap-4 border-y py-3 mb-3">
          <div className="text-center">
            <Clock className="w-4 h-4 mx-auto mb-1" />
            <p>{test.duration} Min</p>
          </div>
          <div className="text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1" />
            <p>{test.questions} Qs</p>
          </div>
          <div className="text-center">
            <Users className="w-4 h-4 mx-auto mb-1" />
            <p>{test.questions * 50}</p>
          </div>
        </div>

        <p className="text-3xl font-bold">{isFree ? "FREE" : `₹${test.price}`}</p>
      </Link>

      {/* ---- CTA Buttons ---- */}
      <div className="mt-4">
        {!showDual ? (
          <Link
            to={`/mocktests/${test._id}`}
            className="block w-full bg-cyan-500 text-gray-900 font-bold py-2 rounded-lg text-center"
          >
            {isFree ? "Start Free" : "View Details"}
          </Link>
        ) : (
          <div className="flex gap-3">
            <Link
              to={`/mocktests/${test._id}`}
              className="flex-1 py-2 border rounded-lg text-center border-cyan-400 text-cyan-300"
            >
              View
            </Link>

            <button
              onClick={handleCart}
              className={`flex-1 py-2 rounded-lg ${
                isAlreadyInCart ? "bg-yellow-500 text-gray-900" : "bg-green-500 text-gray-900"
              }`}
            >
              {isAlreadyInCart ? "In Cart" : "Buy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
