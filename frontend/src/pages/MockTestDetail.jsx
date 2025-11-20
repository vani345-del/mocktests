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

  /* USER */
  const userData = useSelector((state) => state.user.userData);
  const cartItems = useSelector((state) => state.cart.cartItems || []);

  const isAlreadyInCart =
    Array.isArray(cartItems) &&
    cartItems.some((item) => item._id === id);

  /* MOCKTEST */
  const test = useSelector((state) => state.mocktest.selectedMocktest);
  const status = useSelector((state) => state.mocktest.selectedStatus);
  const error = useSelector((state) => state.mocktest.selectedError);

  useEffect(() => {
    if (id) dispatch(fetchPublicTestById(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!userData) {
      toast.error("Please log in");
      return navigate("/login");
    }
    if (isAlreadyInCart) return navigate("/cart");
    dispatch(addItemToCart(id));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <CgSpinner className="animate-spin text-5xl text-blue-600" />
      </div>
    );
  }

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
          Back to Tests
        </Link>
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/mocktests" className="hover:text-blue-600">
            All Tests
          </Link>{" "}
          /{" "}
          <span className="text-gray-900">{test.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN CARD */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg border">

            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              {test.category?.name}
            </span>

            <h1 className="text-4xl font-bold text-gray-900">{test.title}</h1>

            {/* IMAGE */}
            <div className="w-full h-64 bg-slate-100 rounded-lg mt-6 mb-8 grid place-items-center">
              {test.imageUrl ? (
                <img
                  src={test.imageUrl}
                  alt={test.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                "Test Cover Image"
              )}
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-lg">
              <DetailItem
                icon={<FaQuestionCircle />}
                label="Questions"
                value={`${test.totalQuestions}`}
              />
              <DetailItem
                icon={<FaClock />}
                label="Duration"
                value={`${test.durationMinutes} mins`}
              />
              <DetailItem
                icon={<FaCheck />}
                label="Total Marks"
                value={`${test.totalMarks}`}
              />
              <DetailItem
                icon={<FaMinusCircle />}
                label="Negative Marking"
                value={`${test.negativeMarking}`}
              />
              <DetailItem
                icon={<FaBook />}
                label="Subjects"
                value={test.subjects?.map((s) => s.name).join(", ")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Description
            </h2>
            <p className="text-gray-700">{test.description}</p>
          </div>

          {/* RIGHT SIDE CARD */}
          <aside className="bg-white p-6 rounded-lg shadow-lg border sticky top-28">
            <div className="text-center mb-6">
              {test.discountPrice > 0 ? (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{test.price}
                  </span>
                  <br />
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{test.discountPrice}
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-green-600">Free</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-3 text-lg rounded-lg font-semibold transition ${
                isAlreadyInCart
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {isAlreadyInCart ? "Go to Cart" : "Add to Cart"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
