import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, BookOpen, Users, ShoppingCart, Wallet, Play } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";
import api from "../api/axios";

// Helper for Stats
const StatItem = ({ icon: Icon, value, label, accentLight }) => (
    <div className="text-center px-1">
        <Icon size={20} className={`${accentLight} mx-auto mb-1`} />
        <p className="text-xl font-extrabold text-white leading-tight">{value}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

const MockTestCard = ({ test }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);

    const [fetchedImageURL, setFetchedImageURL] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);

    /* ================================
        IMAGE FETCH LOGIC
    ================================ */
    useEffect(() => {
        if (!test.thumbnail) return;

        const fetchImage = async () => {
            setLoadingImage(true);
            try {
                const response = await api.get(test.thumbnail, { responseType: "blob" });
                const url = URL.createObjectURL(response.data);
                setFetchedImageURL(url);
            } catch (error) {
                console.error("Failed to fetch mock test image:", error);
                setFetchedImageURL("https://placehold.co/600x400?text=Image+Load+Error");
            } finally {
                setLoadingImage(false);
            }
        };

        fetchImage();
        return () => fetchedImageURL && URL.revokeObjectURL(fetchedImageURL);
    }, [test.thumbnail]);

    const imageSource = fetchedImageURL || "https://placehold.co/600x400?text=Mock+Test";

    /* ================================
        LOGIC VARIABLES
    ================================ */
    const isFree = test.isFree === true;
    const isGrand = test.isGrandTest === true;
    const students = (test.totalQuestions * 37) + 500;

    const accentColor = isGrand ? "from-indigo-500 to-purple-400" : "from-cyan-500 to-teal-400";
    const accentLight = isGrand ? "text-indigo-400" : "text-cyan-400";
    const glowColor = isGrand ? "shadow-indigo-500/50" : "shadow-cyan-500/50";

    /* ================================
        LOGIN CHECK
    ================================ */
    const handleLoginCheck = () => {
        if (!userData) {
            toast.error("Please login first!");
            navigate("/login");
            return false;
        }
        return true;
    };

    /* ================================
        ADD TO CART
    ================================ */
    const handleAddToCart = () => {
        if (!handleLoginCheck()) return;
        dispatch(addItemToCart(test._id));
        toast.success(`${test.title} added to cart!`);
    };

    /* ================================
        FREE TEST → START EXAM LOGIC
        (Same as MyTestCard)
    ================================ */
    const handleStartTest = () => {
        if (!handleLoginCheck()) return;

        const status = test.status || "not_started";
        const progress = test.progress || 0;

        // Completed test → Report page
        if (status === "completed") {
            navigate(`/student/report/${test._id}`);
            return;
        }

        // Already started → Resume exam
        if (progress > 0) {
            navigate(`/student/instructions/${test._id}`);
            return;
        }

        // New → Start exam
        navigate(`/student/instructions/${test._id}`);
    };

    /* ================================
        VIEW DETAILS (For paid tests)
    ================================ */
    const handleViewDetails = () => {
        navigate(`/mocktests/${test._id}`);
    };

    return (
        <div
            className={`
                group flex flex-col bg-gray-900 rounded-2xl shadow-xl border border-gray-800 
                transition duration-300 w-full transform hover:scale-[1.03] hover:shadow-2xl hover:${glowColor}
            `}
        >
            {/* THUMBNAIL */}
            <div className="relative w-full h-48 sm:h-56">
                {loadingImage ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 animate-pulse text-gray-500 rounded-t-2xl">
                        Fetching Image...
                    </div>
                ) : (
                    <img src={imageSource} alt={test.title} className="w-full h-full object-cover rounded-t-2xl" />
                )}

                {/* Price / Free */}
                <span
                    className={`
                        absolute bottom-0 right-0 px-4 py-2 text-3xl font-extrabold text-white rounded-tl-xl
                        bg-gradient-to-r ${accentColor} shadow-inner shadow-black/50
                    `}
                >
                    {isFree ? "Free" : `₹${test.price}`}
                </span>

                {/* FREE / GRAND BADGE */}
                {(isFree || isGrand) && (
                    <span className="absolute top-4 left-4 bg-green-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                        {isGrand ? "GRAND TEST" : "FREE"}
                    </span>
                )}
            </div>

            {/* CONTENT */}
            <Link to={`/mocktests/${test._id}`} className="p-5 pb-0 flex flex-col flex-grow">
                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        {test.category?.name?.toUpperCase() || "MOCK SERIES"}
                    </p>
                    <h3 className="text-2xl font-extrabold text-white leading-snug line-clamp-2 transition group-hover:text-cyan-300">
                        {test.title}
                    </h3>
                </div>

                <p className="text-sm text-gray-400 mb-5 line-clamp-3 flex-grow">{test.description}</p>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-gray-700/50">
                    <StatItem icon={Clock} value={test.durationMinutes} label="Duration (Min)" accentLight={accentLight} />
                    <StatItem icon={BookOpen} value={test.totalQuestions} label="Questions" accentLight={accentLight} />
                    <StatItem icon={Users} value={students.toLocaleString()} label="Enrolled" accentLight={accentLight} />
                </div>
            </Link>

            {/* ACTION BUTTONS */}
            <div className="p-5 pt-4 flex gap-3 w-full">
                {isFree ? (
                    <button
                        onClick={handleStartTest}
                        className="flex items-center justify-center gap-2 w-full text-white py-3 rounded-lg font-bold transition bg-green-600 hover:bg-green-500 shadow-md"
                    >
                        <Play size={18} /> Start Now
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleViewDetails}
                            className="flex items-center justify-center gap-2 w-1/2 text-white py-3 rounded-lg font-bold transition bg-cyan-600 hover:bg-cyan-500 shadow-md"
                        >
                            <Wallet size={18} /> Buy Now
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="flex items-center justify-center gap-2 w-1/2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition shadow-md"
                        >
                            <ShoppingCart size={18} /> Add to Cart
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default MockTestCard;
