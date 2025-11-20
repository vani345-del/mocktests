import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { clearCart } from '../redux/cartSlice';
import { setUserData } from '../redux/userSlice';
import { ShoppingCart } from 'lucide-react'; // Import icon for empty state

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // SAFE selectors
    const cartItems = useSelector((state) => state.cart.cartItems || []);
    const totalAmount = useSelector((state) => state.cart.totalAmount || 0);
    const { user } = useSelector((state) => state.user);

    // Load Razorpay script
    const loadRazorpayScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const toastId = toast.loading('Processing payment...');

        const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            toast.error('Failed to load Razorpay.', { id: toastId });
            return;
        }

        try {
            // ⭐ LOGIC CHANGE: Check for zero amount and handle as enrollment/free purchase
            const amountInRupees = totalAmount; 
            const amountInPaisa = Math.round(amountInRupees * 100);

            if (amountInPaisa === 0) {
                // If total is 0, skip Razorpay and call the backend endpoint directly for free enrollment
                const { data } = await api.post('/api/payment/enroll-free', {
                    cartItems: cartItems.map(item => item._id),
                });
                
                if (data.success) {
                    toast.success('Enrollment Successful!', { id: toastId });
                    dispatch(setUserData(data.user));
                    dispatch(clearCart());
                    navigate('/student-dashboard');
                } else {
                    toast.error('Free enrollment failed.', { id: toastId });
                }
                return;
            }


            // Create Razorpay order (for paid amount)
            const { data: order } = await api.post('/api/payment/create-order', {
                amount: amountInPaisa, // Razorpay requires amount in paise
                cartItems: cartItems.map(item => item._id)
            });

            if (!order) {
                toast.error('Could not create payment order.', { id: toastId });
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: 'INR',
                name: 'GrandTest Store',
                description: 'Mock Test Purchase',
                image: '/logo.png',
                order_id: order.id,

                handler: async function (response) {
                    try {
                        const { data } = await api.post('/api/payment/verify-payment', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            cartItems: cartItems.map(item => item._id),
                            amount: amountInPaisa // Pass amount in paise for verification
                        });

                        if (data.success) {
                            toast.success('Payment Successful!', { id: toastId });
                            dispatch(setUserData(data.user));
                            dispatch(clearCart());
                            navigate('/student-dashboard');
                        } else {
                            toast.error('Verification failed', { id: toastId });
                        }
                    } catch (error) {
                        toast.error('Verification error', { id: toastId });
                    }
                },

                prefill: {
                    name: user?.name || "Student",
                    email: user?.email || "student@example.com",
                    contact: user?.phone || '', // Added contact if available
                },

                theme: {
                    color: '#4F46E5',
                },
            };

            toast.dismiss(toastId);
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', () => {
                toast.error('Payment failed! Try again.');
            });

        } catch (error) {
            // Check for specific error message from the backend if order creation failed
            const errorMessage = error.response?.data?.message || 'Payment error occurred. Check server logs.';
            toast.error(errorMessage, { id: toastId });
        }
    };

    // --- RENDER START ---
    
    // Empty Cart State (Enhanced Design)
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="max-w-4xl mx-auto pt-40 text-center p-4">
                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-2xl border border-gray-100">
                    <ShoppingCart size={48} className="text-gray-400 mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800">Your Cart is Empty</h2>
                    <p className="text-gray-500 mt-2 mb-8">It looks like you haven't added any tests yet.</p>
                    <button
                        onClick={() => navigate('/mocktests')}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-indigo-700 transition-all"
                    >
                        Browse Mock Tests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-28 pb-16 px-4">
            <div className="max-w-3xl mx-auto">

                <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
                    Secure Checkout
                </h1>

                <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-100">

                    {/* Order Summary */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                        Order Summary
                    </h2>

                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                            <div
                                key={item._id}
                                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm"
                            >
                                <span className="font-medium text-gray-800 truncate pr-4">{item.title}</span>
                                <span className="font-bold text-lg text-gray-900 whitespace-nowrap">
                                    {/* Display 'FREE' if price is zero */}
                                    {item.discountPrice === 0 || item.price === 0 
                                        ? "FREE" 
                                        : `₹${item.discountPrice > 0 ? item.discountPrice : item.price}`
                                    }
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Total Section */}
                    <div className="border-t border-gray-300 mt-6 pt-6">
                        <div className="flex justify-between text-2xl font-extrabold text-gray-900">
                            <span>Total Payable</span>
                            {/* Display Total Amount */}
                            <span className="text-indigo-600">
                                {totalAmount === 0 ? "FREE" : `₹${totalAmount.toFixed(2)}`}
                            </span>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                        onClick={handlePayment}
                        className={`mt-8 w-full py-4 text-xl font-bold rounded-xl transition-all duration-300 shadow-lg 
                            ${totalAmount === 0 
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/50' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/50'
                            }`
                        }
                    >
                        {totalAmount === 0 ? "Enroll Now (FREE)" : `Pay ₹${totalAmount.toFixed(2)}`}
                    </button>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                        Powered by Razorpay. All transactions are secure.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;