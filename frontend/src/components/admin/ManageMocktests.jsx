// frontend/src/components/admin/ManageMocktests.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import {
    FaPlus,
    FaClipboardList,
    FaSpinner,
    FaEdit,
    FaToggleOn,
    FaToggleOff,
    FaTrashAlt,
    FaArrowLeft,
    FaFilter,
    FaRss,
    FaEyeSlash,
    FaBookmark,
} from "react-icons/fa";

import {
    fetchPublicMockTests,
    deleteMockTest,
    togglePublish,
    setCategoryFilter,
} from "../../redux/mockTestSlice";

import { fetchCategories } from "../../redux/categorySlice";

// ------------------------------------------------------------------------

const ManageMocktests = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* ---------------------- SELECTORS ---------------------- */

    const mocktests = useSelector((state) => state.mocktest.publicMocktests);
    const status = useSelector((state) => state.mocktest.publicStatus);
    const error = useSelector((state) => state.mocktest.publicError);

    const selectedCategory = useSelector(
        (state) => state.mocktest.filters.category
    );

    const categories = useSelector((state) => state.category.items);
    const categoriesLoading = useSelector((state) => state.category.loading);

    const isLoading = status === "loading";
    const hasError = status === "failed";

    /* ---------------------- LOAD CATEGORIES ---------------------- */
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    /* ---------------------- LOAD MOCKTESTS ---------------------- */
    useEffect(() => {
        // NOTE: The 'selectedCategory' here is the SLUG, which is correct for frontend filtering.
        // Ensure your 'fetchPublicMockTests' thunk sends this value to the backend 
        // as a QUERY PARAMETER (e.g., ?category=ssc) and that the backend handles the SLUG string.
        dispatch(fetchPublicMockTests());
    }, [dispatch, selectedCategory]);

    /* ---------------------- ACTION HANDLERS ---------------------- */

    const handleCategoryChange = (e) => {
        // Sets the filter to the selected category slug/name (or empty string for all)
        dispatch(setCategoryFilter(e.target.value || ""));
    };

    const handleDelete = (id) => {
        if (!window.confirm("Delete this mock test permanently?")) return;
        dispatch(deleteMockTest(id));
    };

    const handleTogglePublish = (id) => {
        dispatch(togglePublish(id));
    };

    /* ---------------------- HELPER: PRICE FORMAT ---------------------- */

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(price);

    /* ---------------------- UI: CATEGORY BADGES ---------------------- */

    const getCategoryTagClass = (name) => {
        const code = (name || "").charCodeAt(0) || 0;
        switch (code % 4) {
            case 0:
                return "bg-purple-100 text-purple-700 border-purple-300";
            case 1:
                return "bg-indigo-100 text-indigo-700 border-indigo-300";
            case 2:
                return "bg-teal-100 text-teal-700 border-teal-300";
            case 3:
                return "bg-pink-100 text-pink-700 border-pink-300";
            default:
                return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    /* ---------------------- TABLE COMPONENT ---------------------- */

    const MockTestTable = ({ tests }) => (
        <div className="overflow-x-auto bg-white rounded-xl shadow-2xl border border-gray-100/50 mt-6">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                    <tr>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Title / ID
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Category
                        </th>
                        <th className="px-5 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Price / Discount
                        </th>
                        <th className="px-5 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Enrollments
                        </th>
                        <th className="px-5 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Visibility
                        </th>
                        <th className="px-5 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                    {tests.map((test) => {
                        // Use category.slug or category.name if available, otherwise fallback
                        const catName =
                            test.category?.name || test.categorySlug || "N/A";
                        
                        // Extract the category slug for the navigation path
                        const catSlug = 
                            test.category?.slug || test.categorySlug || 'default';
                        
                        const tagClass = getCategoryTagClass(catName);

                        return (
                            <tr
                                key={test._id}
                                className="hover:bg-blue-50/50 transition"
                            >
                                <td className="px-5 py-4">
                                    <p className="font-semibold text-gray-900">
                                        {test.title}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        ID: {test._id.slice(-6)}
                                    </p>
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border shadow-sm ${tagClass}`}
                                    >
                                        <FaBookmark className="mr-1 text-xs" />
                                        {catName}
                                    </span>
                                </td>

                                <td className="px-5 py-4 text-center">
                                    <div
                                        className={`font-extrabold ${
                                            test.discountPrice > 0
                                                ? "text-red-500"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {formatPrice(
                                            test.discountPrice > 0
                                                ? test.discountPrice
                                                : test.price
                                        )}
                                    </div>

                                    {test.discountPrice > 0 && (
                                        <div className="text-xs line-through text-gray-400">
                                            {formatPrice(test.price)}
                                        </div>
                                    )}
                                </td>

                                <td className="px-5 py-4 text-center font-bold">
                                    {test.attempts?.length || 0}
                                </td>

                                <td className="px-5 py-4 text-center">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                                            test.isPublished
                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                        }`}
                                    >
                                        {test.isPublished ? (
                                            <FaRss className="mr-1" />
                                        ) : (
                                            <FaEyeSlash className="mr-1" />
                                        )}
                                        {test.isPublished
                                            ? "Published"
                                            : "Draft"}
                                    </span>
                                </td>

                                <td className="px-5 py-4 text-center space-x-2">
                                    <button
                                        onClick={() =>
                                            handleTogglePublish(test._id)
                                        }
                                        className={`p-2 rounded-full shadow ${
                                            test.isPublished
                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                : "bg-green-50 text-green-600 hover:bg-green-100"
                                        }`}
                                    >
                                        {test.isPublished ? (
                                            <FaToggleOn size={20} />
                                        ) : (
                                            <FaToggleOff size={20} />
                                        )}
                                    </button>

                                    <button
                                        onClick={() =>
                                            // **FIXED ROUTE:** Correctly interpolating the slug and ID
                                            navigate(
                                                `/admin/mocktests/${catSlug}/edit/${test._id}`
                                            )
                                        }
                                        className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 shadow"
                                    >
                                        <FaEdit size={16} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(test._id)
                                        }
                                        className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 shadow"
                                    >
                                        <FaTrashAlt size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    /* ---------------------- MAIN RENDER ---------------------- */

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* TOP HEADER */}
            <header className="mb-8 border-b pb-4">
                <Link
                    to="/admin"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <FaArrowLeft /> Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mt-4">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Mock Test Registry{" "}
                        <span className="text-blue-600">
                            ({mocktests.length})
                        </span>
                    </h2>

                    <button
                        // NOTE: Updated path to match the recommended route structure in App.js
                        onClick={() => navigate("/admin/tests/add-new-test")} 
                        className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700"
                    >
                        <FaPlus className="mr-2" /> Create New Mock Test
                    </button>
                </div>
            </header>

            {/* FILTER SECTION */}
            <div className="bg-white p-4 rounded-xl shadow border flex flex-col sm:flex-row gap-4 items-center">
                <label className="flex items-center font-semibold text-gray-700">
                    <FaFilter className="mr-2 text-indigo-500" /> Category:
                </label>

                {categoriesLoading ? (
                    <FaSpinner className="animate-spin text-indigo-500" />
                ) : (
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="border px-4 py-3 rounded-lg bg-gray-50 focus:ring-indigo-500"
                    >
                        <option value="">All Categories</option>

                        {/* Use category.slug for the value, as the backend needs a string filter */}
                        {categories.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* LOADING, ERROR, TABLE, EMPTY content logic remains the same */}
            {isLoading && (
                <div className="text-center mt-10">
                    <FaSpinner className="animate-spin text-indigo-600 mx-auto" size={40} />
                    <p className="text-gray-600 mt-3">Loading mocktests...</p>
                </div>
            )}

            {hasError && (
                <div className="mt-10 text-center text-red-500 text-xl">
                    {error}
                </div>
            )}

            {!isLoading && !hasError && mocktests.length > 0 && (
                <MockTestTable tests={mocktests} />
            )}

            {!isLoading && mocktests.length === 0 && (
                <div className="text-center text-gray-500 mt-20">
                    <FaClipboardList size={50} className="mx-auto mb-4" />
                    No mock tests found.
                </div>
            )}
        </div>
    );
};

export default ManageMocktests;