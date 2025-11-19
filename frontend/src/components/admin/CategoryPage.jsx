// frontend/src/components/admin/CategoryPage.jsx
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaBook,
  FaToggleOn,
  FaToggleOff,
  FaArrowLeft,
} from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { ClipLoader } from "react-spinners";

export default function CategoryPage() {
  const { category } = useParams(); // <-- Correct slug
  const navigate = useNavigate();

  const [mocktests, setMocktests] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMocktests = async () => {
    setLoading(true);
    try {
      // API call to fetch tests specific to the category slug
      const res = await api.get(`api/admin/mocktests/category?category=${category}`); 
      setMocktests(res.data);
    } catch (err) {
      toast.error("Failed to fetch mocktests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMocktests();
  }, [category]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this mocktest?")) return;
    try {
      await api.delete(`api/admin/mocktests/${id}`);
      toast.success("🗑️ Mocktest deleted successfully!");
      getMocktests();
    } catch {
      toast.error("❌ Failed to delete mocktest");
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.put(`api/admin/mocktests/${id}/publish`);
      toast.success(res.data.message);
      getMocktests();
    } catch {
      toast.error("⚠️ Failed to update publish status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-6 py-10">
      {/* Back Link (points back to the Category Hub: /admin/tests/add-new-test) */}
      <Link
        to="/admin/tests/add-new-test" 
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
      >
        <FaArrowLeft />
        Back to All Categories
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 capitalize text-center sm:text-left tracking-tight">
          {category}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Mocktests
          </span>
        </h1>

        {/* Create Button (links to the actual creation page with category pre-selected) */}
        <Link
          to={`/admin/mocktests/${category}/new`}
          className="mt-5 sm:mt-0 flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 shadow-lg transition-all"
        >
          <FaPlus /> Create Mocktest
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <ClipLoader size={50} color={"#2563EB"} />
          <p className="ml-4 text-lg text-gray-600">Loading Tests...</p>
        </div>
      ) : (
        <AnimatePresence>
          {mocktests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-500 mt-20"
            >
              <p className="text-lg font-medium">No mocktests found yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Click “Create Mocktest” to add one.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {mocktests.map((test, i) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group relative bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative p-6 flex flex-col h-full justify-between">
                    {/* Title */}
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-slate-800 leading-snug">
                          {test.title}
                        </h3>

                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            test.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {test.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <FaBook className="text-gray-400" />
                        {test.subcategory || "General"}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-slate-100"></div>

                    {/* Details */}
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        <FaClock className="inline text-blue-500 mr-2" />
                        Duration:{" "}
                        <span className="font-medium text-slate-800">
                          {test.durationMinutes || "--"} mins
                        </span>
                      </p>
                      <p>
                        📊 Marks:{" "}
                        <span className="font-medium text-slate-800">
                          {test.totalMarks || "--"}
                        </span>
                      </p>
                      <p>
                        ❌ Negative:{" "}
                        <span className="font-medium text-slate-800">
                          {test.negativeMarking || "0"}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 border-t border-slate-100"></div>

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-4">
                      {/* Edit */}
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/mocktests/${category}/edit/${test._id}`
                          )
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        <FaEdit />
                      </button>

                      {/* Questions */}
                      <button
                        onClick={() =>
                          navigate(`/admin/mocktests/${test._id}/questions`)
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded ml-2 text-sm hover:bg-green-600"
                      >
                        Questions
                      </button>

                      <div className="flex items-center gap-3">
                        {/* Publish Toggle */}
                        <button
                          onClick={() => handleTogglePublish(test._id)}
                          title={test.isPublished ? "Unpublish" : "Publish"}
                          className={`p-1.5 rounded-full transition ${
                            test.isPublished
                              ? "text-green-500 hover:text-green-600"
                              : "text-gray-400 hover:text-blue-500"
                          }`}
                        >
                          {test.isPublished ? (
                            <FaToggleOn size={20} />
                          ) : (
                            <FaToggleOff size={20} />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(test._id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium text-sm transition"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}