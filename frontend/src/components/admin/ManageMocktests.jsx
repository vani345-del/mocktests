import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux/categorySlice";
import { useNavigate, Link } from "react-router-dom"; // 1. Import Link
import AddCategory from "./AddCategory";
import { FaArrowLeft } from "react-icons/fa"; // 2. Import icon

const ManageMocktests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: categories, loading } = useSelector((state) => state.category);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories()); // initial load

    // refresh categories whenever "categoryAdded" event is triggered
    const refresh = () => dispatch(fetchCategories());
    window.addEventListener("categoryAdded", refresh);

    return () => window.removeEventListener("categoryAdded", refresh);
  }, [dispatch]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-6">
      {/* 3. Add Back Link */}
      <Link
        to="/admin"
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
      >
        <FaArrowLeft />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Select a Category</h1>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {showAddForm ? "Close Form" : "+ Add Category"}
        </button>
      </div>

      {/* ✅ Show AddCategory form when button clicked */}
      {showAddForm && (
        <div className="mb-8 border border-gray-200 rounded-lg shadow-md p-4 bg-white">
          <AddCategory />
        </div>
      )}

      {/* ✅ Show Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => navigate(`/admin/mocktests/${cat.slug}`)}
            className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition transform hover:scale-105"
          >
            <div className="bg-gray-50 flex items-center justify-center h-40 rounded-t-xl overflow-hidden">
              {cat.image ? (
                <img
                  src={`http://localhost:8000${cat.image}`} // ✅ Correct backend image path
                  alt={cat.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <div className="p-4 text-center font-medium">{cat.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageMocktests;