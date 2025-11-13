import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, status: cartStatus } = useSelector((state) => state.cart);
  const { userData } = useSelector((state) => state.user);

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (!userData) {
      navigate('/login');
    } else if (userData && cartItems.length === 0 && cartStatus === 'succeeded') {
      toast.info('Your cart is empty.');
      navigate('/cart');
    }
  }, [cartItems, userData, cartStatus, navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.price;
      return acc + price;
    }, 0);
  };
  const subtotal = calculateSubtotal();

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    // --- THIS IS WHERE YOU WOULD CALL THE BACKEND ORDER API ---
    // For now, we just simulate success.
    console.log('Placing order with:', {
      user: userData._id,
      items: cartItems.map(item => item._id),
      totalAmount: subtotal
    });
    
    // In a real app: dispatch(createOrder(orderData));
    
    toast.success('Order placed successfully! (Simulation)');
    // dispatch(clearCart()); // You'd clear the cart from Redux
    navigate('/'); // Redirect to home or a "success" page
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Billing Details Form */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6">Billing Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={userData?.name || ''}
                  readOnly
                  className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={userData?.email || ''}
                  readOnly
                  className="mt-1 block w-full p-3 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              {/* Payment Gateway Placeholder */}
              <div className="pt-4">
                 <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                 <div className="mt-2 p-4 border border-blue-200 bg-blue-50 rounded-md text-blue-700 text-center">
                    This is where a payment gateway like Stripe or Razorpay would be integrated.
                 </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
              >
                {subtotal > 0 ? `Pay ₹${subtotal.toFixed(2)}` : 'Complete Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 h-fit sticky top-28">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-4">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between items-center text-gray-700">
                  <span className="w-3/4 truncate">{item.title}</span>
                  <span className="font-medium">₹{item.discountPrice > 0 ? item.discountPrice : item.price}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-4 mt-4">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}