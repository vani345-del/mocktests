import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicTestById } from "../redux/mockTestSlice";
import { addItemToCart } from "../redux/cartSlice";
import { toast } from "react-toastify";
import {
  FaClock,
  FaQuestionCircle,
  FaCheck,
  FaBook,
  FaMinusCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start p-4 bg-white rounded-lg shadow-sm">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function MockTestDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // SAFE SELECTORS ------------------------------------------
// DO NOT create fallback arrays inside useSelector
const userData = useSelector((state) => state.user.userData);
const cartItems = useSelector((state) => state.cart.items);

// SAFE computed value (outside selector)
const isAlreadyInCart =
  Array.isArray(cartItems) && cartItems.some((item) => item._id === id);


  const {
    currentTest: test,
    currentTestStatus: status,
    currentTestError: error,
  } = useSelector((state) => state.mocktest);

  // FETCH THE TEST ------------------------------------------
  useEffect(() => {
    if (id) dispatch(fetchPublicTestById(id));
  }, [dispatch, id]);

  // ADD TO CART HANDLER --------------------------------------
  const handleAddToCart = () => {
    if (!userData) {
      toast.error("Please log in to add items to your cart");
      navigate("/login");
      return;
    }

    if (isAlreadyInCart) {
      navigate("/cart");
      return;
    }

    dispatch(addItemToCart(id));
  };

  // LOADING UI -----------------------------------------------
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <CgSpinner className="animate-spin text-5xl text-blue-600" />
      </div>
    );
  }

  // ERROR UI -------------------------------------------------
  if (status === "failed") {
    return (
      <div className="max-w-4xl mx-auto pt-40 text-center">
        <h2 className="text-2xl font-bold text-red-600">Failed to load test</h2>
        <p className="text-red-500 mt-2">{error}</p>
        <Link
          to="/mocktests"
          className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaArrowLeft className="mr-2" />
          Back to All Tests
        </Link>
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumbs */}
        <div className="mb-6 text-sm font-medium text-gray-500">
          <Link to="/mocktests" className="hover:text-blue-600">
            All Tests
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{test.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200">

            {/* HEADER */}
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-2">
                {test.category?.name || "Test Series"}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {test.title}
              </h1>
            </div>

            {/* IMAGE */}
            <div className="w-full h-64 bg-slate-100 rounded-lg mb-8 flex items-center justify-center text-slate-400">
              {test.imageUrl ? (
                <img
                  src={test.imageUrl}
                  alt={test.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span>Test Cover Image</span>
              )}
            </div>

            {/* DETAILS */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Test Structure
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-lg">
              <DetailItem
                icon={<FaQuestionCircle />}
                label="Total Questions"
                value={`${test.totalQuestions} Questions`}
              />
              <DetailItem
                icon={<FaClock />}
                label="Duration"
                value={`${test.durationMinutes} Mins`}
              />
              <DetailItem
                icon={<FaCheck />}
                label="Total Marks"
                value={`${test.totalMarks} Marks`}
              />
              <DetailItem
                icon={<FaMinusCircle />}
                label="Negative Marking"
                value={`${test.negativeMarking} Marks`}
              />
              <DetailItem
                icon={<FaBook />}
                label="Subjects"
                value={test.subjects?.map((s) => s.name).join(", ") || "General"}
              />
            </div>

            {/* DESCRIPTION */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p>{test.description || "No description provided."}</p>
            </div>
          </div>

          {/* RIGHT SIDE CARD */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 rounded-lg shadow-lg border border-gray-200">

              {/* PRICE */}
              <div className="mb-5 text-center">
                {test.price > 0 ? (
                  <>
                    {test.discountPrice > 0 && (
                      <span className="text-xl text-gray-400 line-through mr-2">
                        ₹{test.price}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{test.discountPrice > 0 ? test.discountPrice : test.price}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-green-600">
                    Free
                  </span>
                )}
              </div>

              {/* BUTTON */}
              <button
                onClick={handleAddToCart}
                className={`w-full text-lg font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 ${
                  isAlreadyInCart
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {test.price > 0
                  ? isAlreadyInCart
                    ? "Go to Cart"
                    : "Add to Cart"
                  : isAlreadyInCart
                  ? "Go to Cart"
                  : "Start Test"}
              </button>

              {/* FEATURES */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  This test includes:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" /> Full-length Mock
                    Test
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" /> Latest Pattern
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" /> Instant Score &
                    Analysis
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" /> Detailed
                    Solutions
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
