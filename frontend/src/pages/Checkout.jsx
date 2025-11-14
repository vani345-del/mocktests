import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { clearCart } from '../redux/cartSlice';
import { setUserData } from '../redux/userSlice';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // SAFER selectors (prevents undefined errors)
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
            toast.error('Razorpay SDK failed to load. Check your connection.', { id: toastId });
            return;
        }

        try {
            // TEST payment: ₹1
            const testAmount = 1;

            // Create razorpay order from backend
            const { data: order } = await api.post('/api/payment/create-order', {
                amount: testAmount,
                cartItems: cartItems
            });

            if (!order) {
                toast.error('Server error. Could not create order.', { id: toastId });
                return;
            }

            // Razorpay modal options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                
                amount: order.amount,
                currency: 'INR',
                name: 'Mocktests Pro',
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
                            amount: testAmount
                        });




                        if (data.success) {
                            toast.success('Thank you! Payment Successful.', { id: toastId });
                             dispatch(setUserData(data.user));
                            dispatch(clearCart());

                            navigate('/student-dashboard');
                        } else {
                            toast.error('Payment verification failed.', { id: toastId });
                        }
                    } catch (err) {
                        console.error('Verification API error:', err);
                        toast.error('Payment verification failed.', { id: toastId });
                    }
                },

                prefill: {
                    name: user?.name || "Student",
                    email: user?.email || "student@example.com",
                },

                notes: {
                    address: 'Vani Institute',
                },

                theme: {
                    color: '#3399cc',
                },
            };

            toast.dismiss(toastId);

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', function () {
                toast.error('Payment Failed. Please try again.');
            });

        } catch (error) {
            console.error('Payment error:', error);
            toast.error('An error occurred. Try again.', { id: toastId });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-3">Order Summary</h2>

                {/* SAFE CHECK – prevents crashing */}
                {!cartItems || cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <div>
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex justify-between items-center mb-2">
                                <span>{item.title}</span>
                                <span>₹{item.price}</span>
                            </div>
                        ))}

                        <hr className="my-2" />

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total (Test Amount)</span>
                            <span>₹1.00</span>
                        </div>

                        <button
                            onClick={handlePayment}
                            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Pay ₹1.00 Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
