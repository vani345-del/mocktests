import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, removeItemFromCart } from '../redux/cartSlice';
import { CgSpinner } from 'react-icons/cg';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';

const CartItem = ({ item, onRemove }) => {
  const price = item.discountPrice > 0 ? item.discountPrice : item.price;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 gap-4">
      {/* Image + Title */}
      <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
        <img
          src={item.imageUrl}
          onError={(e) => (e.target.src = 'https://picsum.photos/100/70')}
          alt={item.title}
          className="w-28 h-20 object-cover rounded-lg shadow bg-slate-200"
        />

        <div className="flex flex-col">
          <Link
            to={`/mocktests/${item._id}`}
            className="text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-2"
          >
            {item.title}
          </Link>
          <p className="text-sm text-gray-500">{item.categorySlug}</p>
        </div>
      </div>

      {/* Price + Remove */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
        <span className="text-xl font-bold text-gray-900">
          {price > 0 ? `₹${price}` : 'Free'}
        </span>

        <button
          onClick={() => onRemove(item._id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
        >
          <FaTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const status = useSelector((state) => state.cart.status);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData) dispatch(fetchCart());
  }, [dispatch, userData]);

  const handleRemove = (mocktestId) => {
    dispatch(removeItemFromCart(mocktestId));
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
    return acc + price;
  }, 0);

  // Loading UI
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <CgSpinner className="animate-spin text-5xl text-blue-600" />
      </div>
    );
  }

  // Not logged in
  if (!userData) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Please login first</h2>
        <p className="text-gray-500 mt-2">You must be logged in to access your cart.</p>
        <Link
          to="/login"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    );
  }

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-gray-500 mt-2">Browse tests and add them to your cart.</p>

        <Link
          to="/mocktests"
          className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          <FaArrowLeft className="mr-2" /> Browse Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">
                Shopping Cart ({cartItems.length} items)
              </h2>
            </div>

            <div>
              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} onRemove={handleRemove} />
              ))}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 rounded-xl shadow-lg border">

              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Taxes</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-4">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 shadow"
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
