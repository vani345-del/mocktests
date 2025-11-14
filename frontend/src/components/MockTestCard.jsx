// src/components/MockTestCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaShoppingCart } from 'react-icons/fa'; // Icon for subjects
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../redux/cartSlice';
import toast from 'react-hot-toast'; // --- ADDED: Assuming you use react-hot-toast ---

// --- MODIFIED: Added 'variant' prop, default to 'catalog' ---
export default function MockTestCard({ test, variant = "catalog" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // --- MODIFIED: Renamed to 'userData' to match your slice ---
  const { userData } = useSelector((state) => state.user);
  const { items: cartItems } = useSelector((state) => state.cart);

  const imageUrl = test.imageUrl || null;

  const isAlreadyInCart = cartItems.some(item => item._id === test._id);
  const isMyTest = variant === 'my-test'; // --- ADDED: Check for variant ---

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation
    if (!userData) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    if (isAlreadyInCart) {
      navigate('/cart');
      return;
    }
    // --- MODIFIED: Dispatch test object or just ID? Your slice will determine this.
    // Assuming addItemToCart just needs the test object, like your original.
    // If it just needs an ID, use dispatch(addItemToCart(test._id));
    dispatch(addItemToCart(test)); 
  };

  // --- ADDED: Handler for the "Start Test" button ---
  const handleStartTest = (e) => {
    e.preventDefault(); // Prevent outer link navigation
    navigate(`/mocktest/write/${test._id}`);
  };
  // --------------------------------------------------

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      <Link to={`/mocktest/${test._id}`} className="flex flex-col flex-grow">
        {/* Image Placeholder */}
        <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400">
          {imageUrl ? (
            <img src={imageUrl} alt={test.title} className="w-full h-full object-cover" />
          ) : (
            <span>No Image</span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2" title={test.title}>
            {test.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 mt-2 flex-grow line-clamp-3 leading-relaxed">
            {test.shortDescription || test.description?.slice(0, 100) + (test.description?.length > 100 ? '...' : '')}
          </p>

          {/* Subjects (Metadata) */}
          <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
            <FaBook className="text-slate-400" />
            <span>{test.subjects?.map(s => s.name).join(', ') || 'General'}</span>
          </div>

          {/* --- MODIFIED FOOTER: Conditional Rendering based on variant --- */}
          <div className="flex items-center justify-between mt-5">
            {isMyTest ? (
              // --- "My Test" Variant ---
              <button
                onClick={handleStartTest}
                className="w-full px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <FaBook />
                Start Test
              </button>
            ) : (
              // --- "Catalog" Variant (Your existing code) ---
              <>
                {/* Price */}
                <div>
                  {test.price > 0 ? (
                    <span className="text-xl font-bold text-gray-800">₹{test.price}</span>
                  ) : (
                    <span className="text-xl font-bold text-green-600">Free</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 ${
                    isAlreadyInCart
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600' // Changed to yellow for "Go to Cart"
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <FaShoppingCart />
                  {isAlreadyInCart ? 'Go to Cart' : 'Add to Cart'}
                </button>
              </>
            )}
          </div>
          {/* ------------------------------------------------------------- */}
        </div>
      </Link>
    </div>
  );
}