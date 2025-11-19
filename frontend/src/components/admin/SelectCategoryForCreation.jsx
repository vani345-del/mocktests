import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux/categorySlice";
import { useNavigate, Link } from "react-router-dom";
import AddCategory from "./AddCategory";
import { FaArrowLeft } from "react-icons/fa";

// --------------------------------------------------
// CLEAN IMAGE URL BUILDER
// --------------------------------------------------
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    let cleaned = imagePath.trim();

    if (!cleaned.startsWith("/")) {
        cleaned = "/" + cleaned;
    }

    return `http://localhost:8000${cleaned}`;
};

const SelectCategoryForCreation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: categories, loading } = useSelector((state) => state.category);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());

        const refresh = () => dispatch(fetchCategories());
        window.addEventListener("categoryAdded", refresh);

        return () => window.removeEventListener("categoryAdded", refresh);
    }, [dispatch]);

    if (loading)
        return <p className="text-center text-gray-500 p-6">Loading Categories...</p>;

    return (
        <div className="p-6">
            <Link
                to="/admin"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-6 transition font-medium"
            >
                <FaArrowLeft />
                Back to Dashboard
            </Link>

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-semibold text-gray-800">
                    📚 Manage Test Categories
                </h1>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
                >
                    {showAddForm ? "Close Form" : "+ Add Category"}
                </button>
            </div>

            {showAddForm && (
                <div className="mb-8 border border-gray-200 rounded-lg shadow-md p-4 bg-white">
                    <AddCategory />
                </div>
            )}

            <p className="text-gray-600 mb-6 border-l-4 border-blue-500 pl-3 py-1 bg-blue-50 rounded-r-md">
                Click a category card to view or create tests under it.
            </p>

            {/* CATEGORY GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {categories.map((cat) => {
                    const finalImgUrl = getImageUrl(cat.image);

                    return (
                        <div
                            key={cat._id}
                            onClick={() => navigate(`/admin/mocktests/${cat.slug}`)}
                            className="bg-white rounded-xl shadow hover:shadow-xl cursor-pointer transition transform hover:scale-105 group"
                        >
                            {/* IMAGE CONTAINER */}
                            <div className="h-40 w-full rounded-t-xl overflow-hidden relative bg-gray-50">
                                {finalImgUrl ? (
                                    <img
                                        src={finalImgUrl}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* NAME */}
                            <div className="p-4 text-center font-bold text-gray-800 group-hover:text-blue-600 transition">
                                {cat.name}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SelectCategoryForCreation;
