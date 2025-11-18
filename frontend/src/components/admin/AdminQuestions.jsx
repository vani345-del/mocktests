// --- FULL UPDATED COMPONENT WITH BULK UPLOAD RESTORED ---
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const initialOption = { text: "", imageUrl: "" };
const initialFile = null;

const getInitialFormState = (defaultCategory) => ({
  questionType: "mcq",
  title: "",
  options: [
    { ...initialOption },
    { ...initialOption },
    { ...initialOption },
    { ...initialOption },
    { ...initialOption },
  ],
  correct: [],
  correctManualAnswer: "",
  marks: 1,
  negative: 0,
  difficulty: "easy",
  category: defaultCategory || "",
});

export default function AdminQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mocktest, setMocktest] = useState(null);

  const [form, setForm] = useState(getInitialFormState(""));
  const [questionImageFile, setQuestionImageFile] = useState(initialFile);
  const [optionImageFiles, setOptionImageFiles] = useState([
    initialFile,
    initialFile,
    initialFile,
    initialFile,
    initialFile,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`api/admin/mocktests/${id}`);
        setMocktest(res.data);

        const defaultSubject = res.data?.subjects?.[0]?.name || "";
        setForm(getInitialFormState(defaultSubject));
      } catch (err) {
        toast.error("Failed to load mocktest data.");
      }
    };
    fetch();
  }, [id]);

  const handleOptionTextChange = (i, val) => {
    const copy = [...form.options];
    copy[i].text = val;
    setForm({ ...form, options: copy });
  };

  const handleOptionFileChange = (i, file) => {
    const copy = [...optionImageFiles];
    copy[i] = file;
    setOptionImageFiles(copy);
  };

  const handleCorrectChange = (i) => {
    setForm((f) => {
      const already = f.correct.includes(i);
      let updated = already
        ? f.correct.filter((x) => x !== i)
        : [...f.correct, i];
      return { ...f, correct: updated.sort() };
    });
  };

  const resetForm = () => {
    const defaultSubject = mocktest?.subjects?.[0]?.name || "";
    setForm(getInitialFormState(defaultSubject));
    setQuestionImageFile(null);
    setOptionImageFiles([null, null, null, null, null]);

    const q = document.getElementById("question-image-input");
    if (q) q.value = "";

    optionImageFiles.forEach((_, i) => {
      const el = document.getElementById(`option-image-input-${i}`);
      if (el) el.value = "";
    });
  };

  const onAddQuestion = async (e) => {
    e.preventDefault();

    if (!form.category.trim()) return toast.error("Please select a subject.");
    if (!form.title.trim()) return toast.error("Question text required.");
    if (form.questionType === "manual" && !form.correctManualAnswer.trim())
      return toast.error("Manual answer required.");

    const fd = new FormData();
    fd.append("questionType", form.questionType);
    fd.append("title", form.title);
    fd.append("marks", form.marks);
    fd.append("negative", form.negative);
    fd.append("difficulty", form.difficulty);
    fd.append("category", form.category);

    if (questionImageFile) fd.append("questionImage", questionImageFile);

    if (form.questionType === "mcq") {
      fd.append(
        "options",
        JSON.stringify(form.options.map((o) => ({ text: o.text })))
      );
      fd.append("correct", JSON.stringify(form.correct));

      optionImageFiles.forEach((file, i) => {
        if (file) fd.append(`optionImage${i}`, file);
      });
    } else {
      fd.append("correctManualAnswer", form.correctManualAnswer);
    }

    const toastId = toast.loading("Adding question...");
    setIsSubmitting(true);

    try {
      await api.post(`/api/admin/mocktests/questions`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Question added!", { id: toastId });
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return toast.error("Select a CSV/XLSX file.");

    const fd = new FormData();
    fd.append("file", bulkFile);

    const toastId = toast.loading("Uploading...");

    try {
      await api.post(`/api/admin/mocktests/questions/bulk-upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Bulk upload done!", { id: toastId });
      document.getElementById("bulk-file-input").value = "";
      setBulkFile(null);
    } catch (err) {
      toast.error("Bulk upload failed", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 text-white">
      <motion.div
        className="max-w-5xl mx-auto bg-white/10 border border-white/20 rounded-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>

        <h2 className="text-3xl font-bold text-center mb-6">Manage Questions</h2>

        {/* -------------------------------- ADD QUESTION FORM -------------------------------- */}
        <form onSubmit={onAddQuestion} className="space-y-6 bg-black/5 p-6 rounded-xl">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Subject"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={(mocktest?.subjects || []).map((s) => ({
                value: s.name,
                label: s.name,
              }))}
            />

            <Select
              label="Difficulty"
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
                { value: "manual", label: "Manual" },
              ]}
            />
          </div>

          <input
            id="question-image-input"
            type="file"
            accept="image/*"
            onChange={(e) => setQuestionImageFile(e.target.files[0])}
            className="file-input w-full"
          />

          <Textarea
            label="Question Text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {form.questionType === "mcq" && (
            <div>
              <p className="text-sm mb-2">Options</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {form.options.map((opt, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-md">
                    <label className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={form.correct.includes(i)}
                        onChange={() => handleCorrectChange(i)}
                      />
                      Correct?
                    </label>

                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + i)}...`}
                      value={opt.text}
                      onChange={(e) =>
                        handleOptionTextChange(i, e.target.value)
                      }
                    />

                    <input
                      id={`option-image-input-${i}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleOptionFileChange(i, e.target.files[0])
                      }
                      className="file-input mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.questionType === "manual" && (
            <Textarea
              label="Correct Manual Answer"
              value={form.correctManualAnswer}
              onChange={(e) =>
                setForm({ ...form, correctManualAnswer: e.target.value })
              }
            />
          )}

          <div className="grid grid-cols-2 gap-4">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cyan-500 text-black py-3 rounded-lg font-bold"
          >
            {isSubmitting ? <ClipLoader size={22} color="#000" /> : "Add Question"}
          </button>
        </form>

        {/* ------------------------------ BULK UPLOAD SECTION (ADDED BACK) ------------------------------ */}
        <div className="mt-10 bg-white/10 p-6 rounded-xl border border-white/20">
          <h3 className="text-xl font-semibold text-cyan-300 mb-3">
            Bulk Upload Questions
          </h3>

          <p className="text-sm text-gray-300 mb-3">
            Upload a CSV/XLSX with columns: <strong>questionType</strong>, 
            <strong>questionImageUrl</strong>, <strong>question</strong>, 
            <strong>subject</strong>, <strong>level</strong>,
            <strong>optionA_text</strong>, <strong>optionA_image</strong>, …
            <strong>correctIndex</strong>, <strong>marks</strong>, 
            <strong>negative</strong>.
          </p>

          <form onSubmit={onBulkUpload} className="flex flex-col md:flex-row gap-3">
            <input
              id="bulk-file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setBulkFile(e.target.files[0])}
              className="file-input bg-slate-800 text-white border border-slate-600 rounded p-2 flex-1"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-semibold disabled:opacity-50"
            >
              {isSubmitting ? <ClipLoader size={20} color="#FFF" /> : "Upload File"}
            </button>
          </form>
        </div>

      </motion.div>
    </div>
  );
}

/* ---------------------------- Reusable Inputs ---------------------------- */

const Input = ({ label, ...props }) => (
  <label className="text-sm flex flex-col">
    {label && <span className="mb-1">{label}</span>}
    <input {...props} className="px-3 py-2 bg-white/10 rounded" />
  </label>
);

const Select = ({ label, options, ...props }) => (
  <label className="text-sm flex flex-col">
    {label && <span className="mb-1">{label}</span>}
    <select
      {...props}
      className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-600"
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value} className="bg-slate-900 text-white">
          {opt.label}
        </option>
      ))}
    </select>
  </label>
);

const Textarea = ({ label, ...props }) => (
  <label className="text-sm flex flex-col">
    {label && <span className="mb-1">{label}</span>}
    <textarea {...props} className="px-3 py-2 bg-white/10 rounded h-24" />
  </label>
);
