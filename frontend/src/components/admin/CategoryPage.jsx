import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaBook,
  FaToggleOn,
  FaToggleOff,
  FaArrowLeft, // 1. Import a back icon
} from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom"; // 2. Import Link
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../api/axios";
import FormMocktest from "./FormMocktest";

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [mocktests, setMocktests] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const getMocktests = async () => {
    try {
      const res = await api.get(`api/admin/mocktests?category=${category}`);
      setMocktests(res.data);
    } catch (err) {
      toast.error("Failed to fetch mocktests");
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
      {/* 3. Add the Back Link here */}
      <Link
        to="/admin/mocktests"
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
      >
        <FaArrowLeft />
        Back to All Categories
      </Link>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 capitalize text-center sm:text-left tracking-tight">
          {category}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Mocktests
          </span>
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="mt-5 sm:mt-0 flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 shadow-lg transition-all"
        >
          <FaPlus /> Create Mocktest
        </button>
      </div>

      {/* Mocktest Cards */}
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
                {/* Accent Highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

                {/* Card Content */}
                <div className="relative p-6 flex flex-col h-full justify-between">
                  {/* Top: Title + Status */}
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

                  {/* Divider */}
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

                  {/* Divider */}
                  <div className="mt-4 border-t border-slate-100"></div>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/mocktests/${test._id}/questions`)
                      }
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition"
                    >
                      <FaEdit /> Manage
                    </button>

                    <div className="flex items-center gap-3">
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

                      <button
                        onClick={() => handleDelete(test._id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium text-sm transition"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Glow Accent */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Form */}
      {showForm && (
        <FormMocktest
          category={category}
          onClose={() => setShowForm(false)}
          onSuccess={getMocktests}
        />
      )}
    </div>
  );
}