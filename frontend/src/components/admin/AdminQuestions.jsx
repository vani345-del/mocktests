import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { useDispatch } from "react-redux";
import { addQuestion, bulkUpload } from "../../redux/mockTestSlice";

export default function AdminQuestions() {
  const { id } = useParams();
  const [mocktest, setMocktest] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    level: "easy",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    negativeMarks: 0,
    explanation: "",
  });
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get(`api/admin/mocktests/${id}`);
      setMocktest(res.data);
    };
    fetch();
  }, [id]);

  const handleOptionChange = (i, val) => {
    const copy = [...form.options];
    copy[i] = val;
    setForm({ ...form, options: copy });
  };

  const onAddQuestion = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      options: JSON.stringify(form.options),
    };
    const result = await dispatch(addQuestion({ id, data }));
    if (addQuestion.fulfilled.match(result)) {
      setForm({
        subject: "",
        level: "easy",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
        negativeMarks: 0,
        explanation: "",
      });
      const res = await api.get(`api/admin/mocktests/${id}`);
      setMocktest(res.data);
    } else {
      alert("Failed: " + JSON.stringify(result.payload));
    }
  };

  const onBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a CSV/XLSX file");
    const result = await dispatch(bulkUpload({ id, file }));
    if (bulkUpload.fulfilled.match(result)) {
      const res = await api.get(`api/admin/mocktests/${id}`);
      setMocktest(res.data);
    } else {
      alert("Bulk upload failed: " + JSON.stringify(result.payload));
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
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
          Add Questions – {mocktest?.title || "Loading..."}
        </h2>

        {/* Add Question Form */}
        <form
          onSubmit={onAddQuestion}
          className="space-y-6 bg-black/5 p-6 rounded-xl shadow-inner"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
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
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              options={[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
            />

            <Input
              label="Marks"
              type="number"
              value={form.marks}
              onChange={(e) =>
                setForm({ ...form, marks: Number(e.target.value) })
              }
            />
          </div>

          <Textarea
            label="Question Text"
            placeholder="Enter the question here..."
            value={form.questionText}
            onChange={(e) =>
              setForm({ ...form, questionText: e.target.value })
            }
          />

          {/* Options */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Options</p>
            <div className="grid grid-cols-2 gap-3">
              {form.options.map((opt, i) => (
                <Input
                  key={i}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Correct Answer"
              placeholder="Enter exact answer"
              value={form.correctAnswer}
              onChange={(e) =>
                setForm({ ...form, correctAnswer: e.target.value })
              }
            />
            <Input
              label="Negative Marks"
              type="number"
              value={form.negativeMarks}
              onChange={(e) =>
                setForm({ ...form, negativeMarks: Number(e.target.value) })
              }
            />
          </div>

          <Textarea
            label="Explanation (optional)"
            placeholder="Add detailed explanation..."
            value={form.explanation}
            onChange={(e) =>
              setForm({ ...form, explanation: e.target.value })
            }
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold shadow-lg hover:shadow-cyan-500/20 transition"
          >
            ➕ Add Question
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
            Upload CSV/XLSX with columns: Subject, Level, Question, OptionA,
            OptionB, OptionC, OptionD, CorrectAnswer, Marks, NegativeMarks,
            Explanation.
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

        {/* Existing Questions */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h4 className="text-xl font-semibold text-cyan-400">
            Existing Questions ({mocktest?.questions?.length || 0})
          </h4>
          <div className="max-h-[450px] overflow-auto mt-3 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-slate-800">
            {mocktest?.questions?.length ? (
              mocktest.questions.map((q, idx) => (
                <motion.div
                  key={q._id || idx}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                  whileHover={{ scale: 1.01 }}
                >
                  <p className="font-semibold">
                    {idx + 1}. {q.questionText}
                  </p>
                  <p className="text-sm text-gray-300">
                    🧩 Subject: {q.subject} | 🎯 Level: {q.level} | ⭐ Marks:{" "}
                    {q.marks}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400">No questions added yet.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ---------------------------- Reusable Inputs ---------------------------- */

const Input = ({ label, ...props }) => (
  <label className="flex flex-col space-y-1 text-sm">
    {label && <span className="text-gray-300">{label}</span>}
    <input
      {...props}
      className="bg-white/10 border border-white/20 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-400 outline-none text-white placeholder-gray-400"
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
          className="bg-slate-800 text-white" // ✅ ensures visible dropdown text
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
