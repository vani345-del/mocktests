// frontend/src/components/admin/AdminQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import { ClipLoader } from "react-spinners"; // Import a spinner

export default function AdminQuestions() {
  const { id } = useParams(); 
  const [mocktest, setMocktest] = useState(null);

  const [form, setForm] = useState({
    questionType: "mcq",
    questionImageUrl: "", // This will hold the URL from the server
    title: "",
    options: [
      { text: "", imageUrl: "" },
      { text: "", imageUrl: "" },
      { text: "", imageUrl: "" },
      { text: "", imageUrl: "" },
    ],
    correct: [], 
    correctManualAnswer: "",
    marks: 1,
    negative: 0,
    difficulty: "easy",
    category: "", 
  });
  
  // --- NEW: State to hold the selected file for the question image ---
  const [questionImageFile, setQuestionImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get(`api/admin/mocktests/${id}`);
      setMocktest(res.data);
      if (res.data?.subjects?.length === 1) {
        setForm(f => ({ ...f, category: res.data.subjects[0].name }));
      }
    };
    fetch();
  }, [id]);

  const handleOptionChange = (i, field, val) => {
    const copy = [...form.options];
    copy[i] = { ...copy[i], [field]: val };
    setForm({ ...form, options: copy });
  };
  
  const handleCorrectChange = (i) => {
    setForm(f => {
      const selected = f.correct.includes(i);
      let newCorrect;
      if (selected) {
        newCorrect = f.correct.filter(idx => idx !== i);
      } else {
        newCorrect = [...f.correct, i].sort();
      }
      return { ...f, correct: newCorrect };
    });
  };

  // --- NEW: Handler for uploading the question image ---
  const handleQuestionImageUpload = async () => {
    if (!questionImageFile) {
      toast.error("Please select an image file first.");
      return;
    }

    const fd = new FormData();
    // 'image' must match the field name in uploadImage.single('image')
    fd.append("image", questionImageFile); 
    
    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      // This route comes from your adminRoute.js, mounted at /api/admin/categories
      const { data } = await api.post("/api/admin/categories/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Set the returned URL into the form state
      setForm(f => ({ ...f, questionImageUrl: data.imageUrl }));
      toast.success("Image uploaded!", { id: toastId });
      setQuestionImageFile(null); // Clear the file input
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      questionType: "mcq",
      questionImageUrl: "",
      title: "",
      options: [
        { text: "", imageUrl: "" },
        { text: "", imageUrl: "" },
        { text: "", imageUrl: "" },
        { text: "", imageUrl: "" },
      ],
      correct: [],
      correctManualAnswer: "",
      marks: 1,
      negative: 0,
      difficulty: "easy",
      category: mocktest?.subjects?.length === 1 ? mocktest.subjects[0].name : "",
    });
    // --- NEW: Reset the file input state ---
    setQuestionImageFile(null);
  };

  const onAddQuestion = async (e) => {
    e.preventDefault();
    
    let data = { ...form };
    if (data.questionType === 'mcq') {
      data.options = data.options.filter(opt => opt.text || opt.imageUrl);
      if (data.options.length < 2) {
        toast.error("MCQ questions must have at least 2 options.");
        return;
      }
      if (data.correct.length === 0) {
        toast.error("MCQ questions must have at least 1 correct answer.");
        return;
      }
    } else {
      if (!data.correctManualAnswer) {
        toast.error("Manual questions must have a correct answer.");
        return;
      }
    }
    
    const toastId = toast.loading("Adding question...");
    try {
      // This route is correct as per your component's comments
      await api.post(`/api/admin/questions`, data);
      toast.success("Question added to global pool!", { id: toastId });
      resetForm();
    } catch (err) {
       toast.error(err.response?.data?.message || "Failed to add question", { id: toastId });
    }
  };
  
  // (onBulkUpload function remains unchanged)
  const onBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);

    const toastId = toast.loading("Uploading questions...");

    try {
      // This route path is correct per your mockTestController
      const { data } = await api.post(
        `/api/admin/mocktests/questions/bulk-upload`, 
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(data.message || "Bulk upload successful!", { id: toastId });
      if (data.errors && data.errors.length > 0) {
        console.error("Bulk Upload Errors:", data.errors);
        toast.error(`Completed with ${data.errors.length} errors. Check console.`, { duration: 5000 });
      }
      setFile(null);
    } catch (err) {
      console.error("Bulk upload failed:", err);
      toast.error(
        err.response?.data?.message || "Bulk upload failed",
        { id: toastId }
      );
    }
  };
  
  const [file, setFile] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 text-white">
      <motion.div
        className="max-w-5xl mx-auto bg-white/10 border border-white/20 backdrop-blur-lg shadow-2xl rounded-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4 transition"
        >
          <FaArrowLeft />
          Back to Mocktest List
        </button>

        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
          Manage Questions
        </h2>
        
        <p className="text-center text-gray-300 mb-4">
          Add questions to the **global pool** for mocktest: <span className="font-bold text-white">{mocktest?.title || "..."}</span>
        </p>

        {/* Add Question Form */}
        <form
          onSubmit={onAddQuestion}
          className="space-y-6 bg-black/5 p-6 rounded-xl shadow-inner"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="Subject"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                { value: "", label: "Select subject" },
                ...(mocktest?.subjects?.map((s) => ({
                  value: s.name,
                  label: s.name,
                })) || []),
              ]}
            />

            <Select
              label="Level"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              options={[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
            />
            
            <Select
              label="Question Type"
              value={form.questionType}
              onChange={(e) => setForm({ ...form, questionType: e.target.value })}
              options={[
                { value: "mcq", label: "Multiple Choice" },
                { value: "manual", label: "Manual Input" },
              ]}
            />
          </div>
          
           {/* --- UPDATED: Question Image Upload Section --- */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Question Image (Optional)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQuestionImageFile(e.target.files[0])}
                className="file-input flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button" // Important: type="button" to not submit the form
                onClick={handleQuestionImageUpload}
                disabled={!questionImageFile || isUploading}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <ClipLoader size={20} color="#000" />
                ) : (
                  <FaUpload />
                )}
                {isUploading ? "Uploading..." : "Upload Image"}
              </motion.button>
            </div>
            {/* Show the URL field once it's available */}
            {form.questionImageUrl && (
              <Input
                label="Uploaded Image URL"
                type="text"
                value={form.questionImageUrl}
                readOnly
                disabled
              />
            )}
          </div>
          {/* --- END: Question Image Upload Section --- */}


          <Textarea
            label="Question Text"
            placeholder="Enter the question here..."
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          {form.questionType === 'mcq' ? (
            <div>
              <p className="text-sm text-gray-300 mb-2">Options</p>
              <div className="grid grid-cols-2 gap-3">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 bg-white/5 rounded-md">
                     <div className="flex items-center gap-2">
                       <input 
                         type="checkbox"
                         checked={form.correct.includes(i)}
                         onChange={() => handleCorrectChange(i)}
                         className="form-checkbox h-5 w-5 bg-transparent border-cyan-400 text-cyan-500 focus:ring-cyan-500"
                       />
                       <span className="text-gray-300">Correct?</span>
                     </div>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + i)} Text`}
                      value={opt.text}
                      onChange={(e) => handleOptionChange(i, 'text', e.target.value)}
                    />
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + i)} Image URL`}
                      value={opt.imageUrl}
                      onChange={(e) => handleOptionChange(i, 'imageUrl', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Textarea
              label="Correct Manual Answer"
              placeholder="Enter the exact correct answer..."
              value={form.correctManualAnswer}
              onChange={(e) =>
                setForm({ ...form, correctManualAnswer: e.target.value })
              }
            />
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Marks"
              type="number"
              value={form.marks}
              onChange={(e) =>
                setForm({ ...form, marks: Number(e.target.value) })
              }
            />
            <Input
              label="Negative Marks"
              type="number"
              value={form.negative}
              onChange={(e) =>
                setForm({ ...form, negative: Number(e.target.value) })
              }
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold shadow-lg hover:shadow-cyan-500/20 transition"
          >
            ➕ Add Question to Pool
          </motion.button>
        </form>

        {/* Bulk Upload Section */}
        <motion.div
          className="mt-10 bg-white/5 p-6 rounded-xl border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">
            Bulk Upload Questions
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Upload CSV/XLSX with columns: <strong>questionType</strong> (mcq/manual), 
            <strong>questionImageUrl</strong>, <strong>question</strong>, <strong>subject</strong>, <strong>level</strong>, 
            <strong>optionA_text</strong>, <strong>optionA_image</strong>, 
            <strong>optionB_text</strong>, <strong>optionB_image</strong>, ... (up to E),
            <strong>correctIndex</strong> (e.g., "0" or "0,2"), <strong>correctManualAnswer</strong>,
            <strong>marks</strong>, <strong>negative</strong>.
          </p>
          <form onSubmit={onBulkUpload} className="flex flex-col md:flex-row gap-3">
            <input
              type="file"
              accept=".csv, .xls, .xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input flex-1"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-white shadow-lg"
            >
              ⬆ Upload File
            </motion.button>
          </form>
        </motion.div>
        
      </motion.div>
    </div>
  );
}

/* ---------------------------- Reusable Inputs (No changes) ---------------------------- */

const Input = ({ label, ...props }) => (
  <label className="flex flex-col space-y-1 text-sm">
    {label && <span className="text-gray-300">{label}</span>}
    <input
      {...props}
      className="bg-white/10 border border-white/20 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-400 outline-none text-white placeholder-gray-400 disabled:bg-white/5"
    />
  </label>
);

const Select = ({ label, options, ...props }) => (
  <label className="flex flex-col space-y-1 text-sm">
    {label && <span className="text-gray-300">{label}</span>}
    <select
      {...props}
      className="bg-white/10 border border-white/20 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-400 outline-none text-white appearance-none"
    >
      {options.map((opt, i) => (
        <option
          key={i}
          value={opt.value}
          className="bg-slate-800 text-white"
        >
          {opt.label}
        </option>
      ))}
    </select>
  </label>
);

const Textarea = ({ label, ...props }) => (
  <label className="flex flex-col space-y-1 text-sm">
    {label && <span className="text-gray-300">{label}</span>}
    <textarea
      {...props}
      className="bg-white/10 border border-white/20 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-400 outline-none text-white h-24 resize-none"
    />
  </label>
);