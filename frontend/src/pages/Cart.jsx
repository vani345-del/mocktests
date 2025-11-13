import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, removeItemFromCart } from '../redux/cartSlice';
import { CgSpinner } from 'react-icons/cg';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';

const CartItem = ({ item, onRemove }) => {
  const price = item.discountPrice > 0 ? item.discountPrice : item.price;
  
  return (
    <div className="flex items-start sm:items-center justify-between p-4 border-b border-gray-200 gap-4 flex-col sm:flex-row">
      <div className="flex items-start sm:items-center gap-4">
        <img 
          src={item.imageUrl || 'https://via.placeholder.com/100x70'} 
          alt={item.title}
          className="w-24 h-16 object-cover rounded-md bg-slate-100"
        />
        <div>
          <Link to={`/mocktest/${item._id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
            {item.title}
          </Link>
          <p className="text-sm text-gray-500">{item.categorySlug}</p>
        </div>
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
         <span className="text-lg font-bold text-gray-800">
           {price > 0 ? `₹${price}` : 'Free'}
         </span>
        <button 
          onClick={() => onRemove(item._id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
          title="Remove item"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, error } = useSelector((state) => state.cart);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData) {
      dispatch(fetchCart());
    }
  }, [dispatch, userData]);

  const handleRemove = (mocktestId) => {
    dispatch(removeItemFromCart(mocktestId));
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.price;
      return acc + price;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <CgSpinner className="animate-spin text-5xl text-blue-600" />
      </div>
    );
  }

  if (!userData) {
     return (
      <div className="max-w-4xl mx-auto pt-40 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Please log in</h2>
        <p className="text-gray-600 mt-2 mb-6">You must be logged in to view your cart.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </div>
     )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto pt-40 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Your Cart is Empty</h2>
        <p className="text-gray-600 mt-2 mb-6">Looks like you haven't added any mock tests yet.</p>
        <Link
          to="/mocktests"
          className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaArrowLeft className="mr-2" />
          Browse Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items (Left) */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h2>
            </div>
            <div>
              {items.map(item => (
                <CartItem key={item._id} item={item} onRemove={handleRemove} />
              ))}
            </div>
          </div>

          {/* Order Summary (Right) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b pb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxes</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-4">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
              >
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}