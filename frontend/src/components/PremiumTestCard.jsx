// PremiumTestCard.jsx (FIXED CODE)

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, BookOpen, Users, ShoppingCart, Wallet, Play } from "lucide-react"; 
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";
import api from "../api/axios";

// Assuming StatItem is a common component
const StatItem = ({ icon: Icon, value, label, accentLight }) => (
    <div className="text-center">
        <Icon size={18} className={`${accentLight} mx-auto mb-1`} />
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
);

const PremiumTestCard = ({ test }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // --- Redux State Access (Safely initializing arrays) ---
    const { userData } = useSelector((state) => state.user);
    const { items: cartItems } = useSelector((state) => state.cart);

    // 🛑 FIX for TypeError: Ensure purchasedTests is an array before using 'some'
    const purchasedTests = userData?.purchasedTests || []; // Use optional chaining + default to []
    
    // 🛑 FIX for TypeError: Ensure cartItems is an array before using 'some'
    const validCartItems = cartItems || [];
    
    // Line 29 (or similar logic) is where the error occurs:
    const isPurchased = Array.isArray(purchasedTests) && purchasedTests.some(
        (item) => item._id === test._id // assuming purchased item has _id
    );

    const isInCart = Array.isArray(validCartItems) && validCartItems.some(
        (item) => item.mockTestId === test._id // Adjust field based on your cart structure
    );
    // --- End Redux State Access ---


    const [fetchedImageURL, setFetchedImageURL] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);

    /* Image Fetching Logic... (kept brief for focus) */
    useEffect(() => {
        if (!test.thumbnail) return;
        const fetchImage = async () => {
            setLoadingImage(true);
            try {
                const response = await api.get(test.thumbnail, { responseType: 'blob' });
                setFetchedImageURL(URL.createObjectURL(response.data));
            } catch (error) {
                setFetchedImageURL("https://placehold.co/600x400?text=Image+Load+Error");
            } finally {
                setLoadingImage(false);
            }
        };
        fetchImage();
        return () => { if (fetchedImageURL) URL.revokeObjectURL(fetchedImageURL); };
    }, [test.thumbnail]);

    const imageSource = fetchedImageURL || "https://placehold.co/600x400?text=Mock+Test";
    
    // ... rest of the component logic (flags, actions, JSX rendering) ...

    const isFree = test.isFree === true;
    const isGrand = test.isGrandTest === true;
    const students = (test.totalQuestions * 37) + 500;

    const accentColor = isGrand
        ? "from-indigo-500 to-purple-400"
        : "from-cyan-500 to-teal-400";

    const accentLight = isGrand ? "text-indigo-400" : "text-cyan-400";
    const glowColor = isGrand ? "shadow-indigo-500/50" : "shadow-cyan-500/50";

    const handleLoginCheck = () => {
        if (!userData) {
            toast.error("Please login first!");
            navigate("/login");
            return false;
        }
        return true;
    };
    
    const handleAddToCart = () => {
        if (!handleLoginCheck() || isInCart || isPurchased) return;
        dispatch(addItemToCart(test._id));
        toast.success(`${test.title} added to cart!`);
    };

    const handleStartTest = () => {
        if (!handleLoginCheck()) return;
        navigate(`/mocktests/${test._id}`);
    };
    
    const handlePrimaryAction = () => {
        if (isFree || isPurchased) {
            handleStartTest();
        } else {
            handleViewDetails();
        }
    };
    
    const handleViewDetails = () => {
         navigate(`/mocktests/${test._id}`);
    };

    const getButtonText = () => {
        if (isFree || isPurchased) return "Start Test";
        if (isInCart) return "In Cart";
        return "Buy Now";
    };

    return (
        <div
            className={`
                group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer
                bg-gray-900/80 backdrop-blur-md border border-gray-800 shadow-2xl 
                hover:${glowColor}
                transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.03]
                before:content-[''] before:absolute before:inset-0 before:rounded-2xl 
                before:border-2 before:opacity-0 group-hover:opacity-100 
                before:transition-opacity before:duration-500 before:border-transparent 
                before:bg-clip-border before:bg-gradient-to-r before:${accentColor}
            `}
        >

            {/* ★ FREE BADGE */}
            {(isFree || isGrand) && (
                <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                    FREE
                </span>
            )}
            
            {/* ★ THUMBNAIL */}
            <div className="relative w-full h-40">
                {loadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 animate-pulse text-gray-500">Loading Image...</div>
                ) : (
                    <img src={imageSource} alt={test.title} className="w-full h-full object-cover"/>
                )}
            </div>

            {/* HEADER / INFO SECTION (Linked to details page) */}
            <Link to={`/mocktests/${test._id}`} className="p-6 flex flex-col flex-grow">
                
                <div className="mb-4">
                    {test.category?.name && (
                        <p className="text-sm font-semibold text-gray-400 mb-1 tracking-wider">
                            {test.category.name.toUpperCase()}
                        </p>
                    )}
                    <h3 className="text-2xl font-bold text-white leading-snug line-clamp-2">
                        {test.title}
                    </h3>
                </div>

                <p className="text-gray-400 text-sm mb-5 line-clamp-3 flex-grow">
                    {test.description}
                </p>

                <div className="grid grid-cols-3 gap-4 border-y border-gray-700/50 py-4 mb-5">
                    <StatItem icon={Clock} value={`${test.durationMinutes} Min`} label="Duration" accentLight={accentLight} />
                    <StatItem icon={BookOpen} value={`${test.totalQuestions} Qs`} label="Questions" accentLight={accentLight} />
                    <StatItem icon={Users} value={students.toLocaleString().replace(/,/g, " ")} label="Enrolled" accentLight={accentLight} />
                </div>

                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 drop-shadow-lg">
                    {isFree ? "Free" : `₹${test.price}`}
                </p>

            </Link>

            {/* ============================
                ACTION BUTTONS
            ============================ */}
            <div className="p-6 pt-0 flex gap-3 w-full">

                {/* --- Primary Button: Start Test (FREE or Purchased) or Buy Now --- */}
                <button
                    onClick={handlePrimaryAction}
                    className={`flex items-center justify-center gap-2 text-white py-3 rounded-lg font-bold transition w-full 
                        ${(isFree || isPurchased) ? "bg-green-600 hover:bg-green-500" : "bg-cyan-600 hover:bg-cyan-500 w-1/2"}
                    `}
                >
                    {(isFree || isPurchased) ? <Play size={18} /> : <Wallet size={18} />}
                    {getButtonText()}
                </button>


                {/* --- Secondary Button: Add to Cart (PAID, NOT PURCHASED, NOT IN CART) --- */}
                {!(isFree || isPurchased) && (
                    <button
                        onClick={handleAddToCart}
                        disabled={isInCart}
                        className={`flex items-center justify-center gap-2 w-1/2 text-white py-3 rounded-lg font-semibold transition ${
                            isInCart ? "bg-gray-500 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        <ShoppingCart size={18} />
                        {isInCart ? "In Cart" : "Add to Cart"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PremiumTestCard;