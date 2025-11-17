import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUpload, FaPlusCircle, FaSave, FaArrowLeft } from "react-icons/fa"; // 1. Import icon

const EditMocktestPage = () => {
  const { id } = useParams();
  const [mocktest, setMocktest] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const serverURL = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const fetchMocktest = async () => {
      try {
        const res = await axios.get(`${serverURL}api/admin/mocktests/${id}`);
        setMocktest(res.data.mocktest);
      } catch (err) {
        toast.error("Failed to load mocktest details");
      }
    };
    fetchMocktest();
  }, [id]);

  const handleChange = (e) => {
    setMocktest({ ...mocktest, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${serverURL}api/admin/mocktests/${id}`, mocktest);
      toast.success("Mocktest updated successfully!");
      navigate(-1);
    } catch (err) {
      toast.error("Failed to update mocktest");
    } finally {
      setLoading(false);
    }
  };

  if (!mocktest) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 2. Add Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
      >
        <FaArrowLeft />
        Back
      </button>

      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Edit Mocktest: {mocktest.title}
      </h1>

      {/* Editable Form */}
      <div className="space-y-4 bg-white shadow rounded-lg p-5">
        <input
          type="text"
          name="title"
          value={mocktest.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Title"
        />
        <input
          type="text"
          name="subcategory"
          value={mocktest.subcategory}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Subcategory"
        />
        <input
          type="number"
          name="duration"
          value={mocktest.duration}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Duration"
        />
        <input
          type="number"
          name="totalMarks"
          value={mocktest.totalMarks}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Total Marks"
        />
        <input
          type="number"
          name="negativeMarks"
          step="0.01"
          value={mocktest.negativeMarks}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Negative Marks"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaSave />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Question Section */}
      <div className="mt-10 bg-white shadow rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-4">Manage Questions</h2>
        <div className="grid grid-cols-2 gap-5">
          <button
            onClick={() => toast.info("Add Question Form Coming Soon!")}
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-500 p-6 rounded-xl cursor-pointer transition"
          >
            <FaPlusCircle size={30} className="text-blue-600" />
            <span className="text-gray-700 font-medium">Add Each Question</span>
          </button>

          <button
            onClick={() => toast.info("Bulk Upload Coming Soon!")}
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-green-500 p-6 rounded-xl cursor-pointer transition"
          >
            <FaUpload size={30} className="text-green-600" />
            <span className="text-gray-700 font-medium">Bulk Upload</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMocktestPage;