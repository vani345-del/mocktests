// frontend/src/components/admin/AdminQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import { ClipLoader } from "react-spinners"; // Import a spinner

// ✅ --- UPDATED INITIAL STATES ---
const initialOption = { text: "", imageUrl: "" }; // imageUrl is for display only
const initialFile = null;

const initialFormState = {
  questionType: "mcq",
  title: "",
  options: [
    { ...initialOption },
    { ...initialOption },
    { ...initialOption },
    { ...initialOption },
    { ...initialOption }, // Match 5 options from your middleware
  ],
  correct: [],
  correctManualAnswer: "",
  marks: 1,
  negative: 0,
  difficulty: "easy",
  category: "",
};
// --- END UPDATED STATES ---

export default function AdminQuestions() {
  const { id } = useParams();
  const [mocktest, setMocktest] = useState(null);

  // ✅ --- SEPARATE STATE for form text and form files ---
  const [form, setForm] = useState(initialFormState);
  
  const [questionImageFile, setQuestionImageFile] = useState(initialFile);
  const [optionImageFiles, setOptionImageFiles] = useState([
    initialFile,
    initialFile,
    initialFile,
    initialFile,
    initialFile,
  ]);
  // --- END STATE ---

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkFile, setBulkFile] = useState(null); // Renamed from 'file'

  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`api/admin/mocktests/${id}`);
        setMocktest(res.data);
        if (res.data?.subjects?.length === 1) {
          setForm((f) => ({ ...f, category: res.data.subjects[0].name }));
        }
      } catch (err) {
        toast.error("Failed to load mock test data.");
      }
    };
    fetch();
  }, [id]);

  // ✅ --- UPDATED: Handler for option TEXT
  const handleOptionTextChange = (i, val) => {
    const copy = [...form.options];
    copy[i] = { ...copy[i], text: val };
    setForm({ ...form, options: copy });
  };
  
  // ✅ --- NEW: Handler for option FILES
  const handleOptionFileChange = (i, file) => {
    const copy = [...optionImageFiles];
    copy[i] = file;
    setOptionImageFiles(copy);
  };

  const handleCorrectChange = (i) => {
    setForm((f) => {
      const selected = f.correct.includes(i);
      let newCorrect;
      if (selected) {
        newCorrect = f.correct.filter((idx) => idx !== i);
      } else {
        newCorrect = [...f.correct, i].sort((a, b) => a - b);
      }
      return { ...f, correct: newCorrect };
    });
  };

  // ❌ --- REMOVED: handleQuestionImageUpload (no longer needed) ---

  const resetForm = () => {
    setForm({
      ...initialFormState,
      category:
        mocktest?.subjects?.length === 1 ? mocktest.subjects[0].name : "",
    });
    // ✅ --- NEW: Reset file states ---
    setQuestionImageFile(initialFile);
    setOptionImageFiles([
      initialFile,
      initialFile,
      initialFile,
      initialFile,
      initialFile,
    ]);
    // Clear file inputs
    document.getElementById("question-image-input").value = null;
    optionImageFiles.forEach((_, i) => {
      document.getElementById(`option-image-input-${i}`).value = null;
    });
  };

  // ✅ --- FULLY REWRITTEN: onAddQuestion to use FormData ---
  const onAddQuestion = async (e) => {
    e.preventDefault();

    if (!form.category) {
      toast.error('Please select a subject.');
      return;
    }
    
    // 1. Create FormData
    const fd = new FormData();

    // 2. Append all text fields
    fd.append('questionType', form.questionType);
    fd.append('title', form.title);
    fd.append('marks', form.marks);
    fd.append('negative', form.negative);
    fd.append('difficulty', form.difficulty);
    fd.append('category', form.category);

    // 3. Append main question image file
    if (questionImageFile) {
      fd.append('questionImage', questionImageFile);
    }

    // 4. Handle MCQ vs Manual data
    if (form.questionType === 'mcq') {
      // Send options text (without image data) as a JSON string
      fd.append(
        'options',
        JSON.stringify(form.options.map((opt) => ({ text: opt.text })))
      );
      // Send correct answers as a JSON string
      fd.append('correct', JSON.stringify(form.correct));

      // Append option image files
      optionImageFiles.forEach((file, i) => {
        if (file) {
          fd.append(`optionImage${i}`, file); // Key must match middleware
        }
      });
    } else {
      // Send manual answer
      fd.append('correctManualAnswer', form.correctManualAnswer);
    }
    
    // 5. Submit the form
    setIsSubmitting(true);
    const toastId = toast.loading("Adding question to pool...");
    try {
      // This route now matches your backend setup
      await api.post(`/api/admin/mocktests/questions`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Question added to global pool!", { id: toastId });
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add question", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // ✅ --- END REWRITE ---
  
  // (onBulkUpload function remains unchanged, but I fixed the state name)
  const onBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) { // ✅ Use bulkFile
      toast.error("Please select a file");
      return;
    }
    const fd = new FormData();
    fd.append("file", bulkFile); // ✅ Use bulkFile

    const toastId = toast.loading("Uploading questions...");
    setIsSubmitting(true); // ✅ Disable form while bulk uploading

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
      setBulkFile(null); // ✅ Reset bulkFile
      document.getElementById("bulk-file-input").value = null;
    } catch (err) {
      console.error("Bulk upload failed:", err);
      toast.error(
        err.response?.data?.message || "Bulk upload failed",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false); // ✅ Re-enable form
    }
  };

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
          
           {/* --- ✅ UPDATED: Question Image Upload Section --- */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Question Image (Optional)</label>
            <input
              id="question-image-input"
              type="file"
              accept="image/*"
              onChange={(e) => setQuestionImageFile(e.target.files[0])}
              className="file-input w-full"
            />
            {/* ❌ REMOVED separate upload button and URL field */}
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
              {/* ✅ UPDATED to grid-cols-1 on small screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      onChange={(e) => handleOptionTextChange(i, e.target.value)}
                    />
                    {/* ✅ --- NEW: File input for each option --- */}
                    <input
                      id={`option-image-input-${i}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleOptionFileChange(i, e.target.files[0])
                      }
                      className="file-input w-full text-xs"
                    />
                    {/* ❌ REMOVED image URL input field */}
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
            disabled={isSubmitting} // ✅ Use isSubmitting
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold shadow-lg hover:shadow-cyan-500/20 transition disabled:opacity-50"
          >
            {isSubmitting ? <ClipLoader size={22} color="#000" /> : '➕ Add Question to Pool'}
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
            {/* ✅ --- UPDATED to match controller keys --- */}
            Upload CSV/XLSX with columns: <strong>questiontype</strong> (mcq/manual), 
            <strong>questionimageurl</strong>, <strong>question</strong>, <strong>subject</strong>, <strong>level</strong>, 
            <strong>optiona_text</strong>, <strong>optiona_image</strong>, 
            <strong>optionb_text</strong>, <strong>optionb_image</strong>, ... (up to e),
            <strong>correctindex</strong> (e.g., "0" or "0,2"), <strong>correctmanualanswer</strong>,
            <strong>marks</strong>, <strong>negative</strong>, <strong>tags</strong> (comma-separated).
          </p>
          <form onSubmit={onBulkUpload} className="flex flex-col md:flex-row gap-3">
            <input
              id="bulk-file-input"
              type="file"
              accept=".csv, .xls, .xlsx"
              onChange={(e) => setBulkFile(e.target.files[0])} // ✅ Use setBulkFile
              className="file-input flex-1"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting} // ✅ Use isSubmitting
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-white shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <ClipLoader size={20} color="#FFF" /> : '⬆ Upload File'}
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