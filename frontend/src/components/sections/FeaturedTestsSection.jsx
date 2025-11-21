import React, { useState, useEffect } from "react";
import { Clock, BookOpen, Users, Rocket, Wallet, ShoppingCart, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../../redux/cartSlice"; // Assuming redux path is correct
import { toast } from "react-toastify";
import api from "../../api/axios"; // Import your configured axios instance


// Helper for Stats (assuming this helper is now internal or defined below)
const StatItem = ({ icon: Icon, value, label, accentLight }) => (
    <div className="text-center">
        <Icon size={18} className={`${accentLight} mx-auto mb-1`} />
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
);


const TestCard = ({ test }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);

    // State for image fetching
    const [fetchedImageURL, setFetchedImageURL] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);

    /* ================================
        IMAGE FETCH LOGIC (using Axios)
    ================================ */
    useEffect(() => {
        if (!test.thumbnail) return;

        const fetchImage = async () => {
            setLoadingImage(true);
            try {
                const response = await api.get(test.thumbnail, {
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(response.data);
                setFetchedImageURL(url);
            } catch (error) {
                console.error("Failed to fetch mock test image via API:", error);
                setFetchedImageURL("https://placehold.co/600x400?text=Image+Load+Error");
            } finally {
                setLoadingImage(false);
            }
        };

        fetchImage();

        return () => {
            if (fetchedImageURL) {
                URL.revokeObjectURL(fetchedImageURL);
            }
        };
    }, [test.thumbnail]);

    const imageSource = fetchedImageURL || "https://placehold.co/600x400?text=Mock+Test";
    
    /* ================================
        TEST FLAGS & STYLES
    ================================ */
    const isFree = test.isFree === true;
    const isGrand = test.isGrandTest === true;
    const students = (test.totalQuestions * 37) + 500;

    const accentColor = isGrand
        ? "from-indigo-500 to-purple-400"
        : "from-cyan-500 to-teal-400";

    const accentLight = isGrand ? "text-indigo-400" : "text-cyan-400";
    const glowColor = isGrand ? "shadow-indigo-500/50" : "shadow-cyan-500/50";
    
    /* ================================
        HANDLE ACTIONS
    ================================ */
    const handleLoginCheck = () => {
        if (!userData) {
            toast.error("Please login first!");
            navigate("/login");
            return false;
        }
        return true;
    };
    
    const handleAddToCart = () => {
        if (!handleLoginCheck()) return;
        dispatch(addItemToCart(test._id));
        toast.success(`${test.title} added to cart!`);
    };

    const handleStartTest = () => {
        if (!handleLoginCheck()) return;
        navigate(`/mocktests/${test._id}`);
    };
    
    const handleViewDetails = () => {
         navigate(`/mocktests/${test._id}`);
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 animate-pulse text-gray-500">
                        Loading Image...
                    </div>
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
                ACTION BUTTONS (Your Requested Logic)
            ============================ */}
            <div className="p-6 pt-0 flex gap-3 w-full">

                {isFree ? (
                    // 1. FREE TEST: Show "Start Now" button
                    <button
                        onClick={handleStartTest}
                        className="flex items-center justify-center gap-2 w-full text-white py-3 rounded-lg font-bold transition bg-green-600 hover:bg-green-500"
                    >
                        <Play size={18} /> Start Now
                    </button>
                ) : (
                    // 2. PAID TEST: Show "Buy Now" and "Add to Cart"
                    <>
                        <button
                            onClick={handleViewDetails}
                            className="flex items-center justify-center gap-2 w-1/2 text-white py-3 rounded-lg font-bold transition bg-cyan-600 hover:bg-cyan-500"
                        >
                            <Wallet size={18} /> Buy Now
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="flex items-center justify-center gap-2 w-1/2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                        >
                            <ShoppingCart size={18} /> Add to Cart
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Assuming TestCard is the component passed via CardComponent={MockTestCard}
export { TestCard };


// ----------------------------------------------------
// FEATURED SECTION COMPONENT
// ----------------------------------------------------

const FeaturedTestsSection = ({ id, title, tests, loading, showViewAll, onViewAll, CardComponent = TestCard }) => {
  const darkBg = id === "grand-tests";

  return (
    <section className={`py-20 md:py-28 ${darkBg ? "bg-gray-900" : "bg-gray-950"} text-gray-100 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://api.netlify.com/builds/grid.svg')]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-md font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Top Rated Series
          </p>
          <h2 className="text-center text-4xl md:text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
              {title}
            </span>
          </h2>
        </div>

        {loading && (
          <p className="text-center text-cyan-400 animate-pulse text-lg">Loading...</p>
        )}

        {!loading && tests.length === 0 && (
          <p className="text-center text-gray-500 text-lg">No tests found.</p>
        )}

        <div className="grid gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {!loading && tests.map((test) => <CardComponent key={test._id} test={test} />)}
        </div>

        {showViewAll && (
          <div className="text-center mt-16">
            <button
              onClick={onViewAll}
              className="px-10 py-3 font-extrabold text-gray-900 bg-cyan-400 rounded-full shadow-2xl shadow-cyan-500/50 hover:bg-cyan-300 transform hover:scale-[1.05]"
            >
              View All Tests
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTestsSection;