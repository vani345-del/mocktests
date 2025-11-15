// frontend/src/components/admin/FormMocktest.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { createMockTest } from "../../redux/mockTestSlice";
import { useNavigate, useParams } from "react-router-dom";

const defaultSubject = { name: "", easy: 0, medium: 0, hard: 0 };

export default function FormMocktest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { category } = useParams();

  const [form, setForm] = useState({
    category: category || "",
    subcategory: "",
    title: "",
    description: "",
    durationMinutes: 60,
    totalQuestions: 0,
    totalMarks: 0,
    negativeMarking: 0,
    price: 0,
    discountPrice: 0,
    isPublished: false,
  });

  // --- 👇 NEW STATE FOR GRAND TEST ---
  const [isGrandTest, setIsGrandTest] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  // --- 👆 END OF NEW STATE ---

  const [subjects, setSubjects] = useState([{ ...defaultSubject }]);

  const handleSubjectChange = (i, key, value) => {
    const copy = [...subjects];
    copy[i][key] = key === "name" ? value : Number(value);
    setSubjects(copy);
  };

  const addSubject = () => setSubjects([...subjects, { ...defaultSubject }]);
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));

  const onSubmit = async (e, publish = false) => {
    e.preventDefault();
    const payload = {
      ...form,
      subjects,
      isPublished: publish,
      // --- 👇 ADD NEW FIELDS TO PAYLOAD ---
      isGrandTest: isGrandTest,
      scheduledFor: isGrandTest ? scheduledFor : null // Only send schedule if it's a grand test
      // --- 👆 END OF NEW FIELDS ---
    };
    payload.totalQuestions = subjects.reduce(
      (acc, s) => acc + (s.easy + s.medium + s.hard),
      0
    );
    
    // --- Basic Validation ---
    if (isGrandTest && !scheduledFor) {
      alert("Please select a date and time for the Grand Test.");
      return;
    }

    try {
      const resultAction = await dispatch(createMockTest(payload));
      if (createMockTest.fulfilled.match(resultAction)) {
        const id = resultAction.payload._id;
        navigate(`/admin/mocktests/${id}/questions`);

      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 text-white"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
          Create Mock Test
        </h2>

        <form onSubmit={(e) => onSubmit(e, false)} className="space-y-6">
          {/* Category & Subcategory */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              label="Subcategory"
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
            />
          </div>

          {/* Title */}
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {/* Description */}
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Marks & Duration */}
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: Number(e.target.value) })
              }
            />
            <Input
              label="Total Marks"
              type="number"
              value={form.totalMarks}
              onChange={(e) =>
                setForm({ ...form, totalMarks: Number(e.target.value) })
              }
            />
            <Input
              label="Negative Marking (per question)"
              type="number"
              value={form.negativeMarking}
              onChange={(e) =>
                setForm({ ...form, negativeMarking: Number(e.target.value) })
              }
            />
          </div>

          {/* Price Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />
            <Input
              label="Discount Price"
              type="number"
              value={form.discountPrice}
              onChange={(e) =>
                setForm({ ...form, discountPrice: Number(e.target.value) })
              }
            />
          </div>
          
          {/* --- 👇 NEW GRAND TEST FIELDS --- */}
          <div className="pt-4 border-t border-white/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-500"
                  checked={isGrandTest}
                  onChange={(e) => setIsGrandTest(e.target.checked)}
                />
                <span className="text-lg font-medium text-cyan-400">Is this a Grand Test?</span>
              </label>

              {isGrandTest && (
                <motion.div
                  initial={{ opacity: 0, flex: 0.5 }}
                  animate={{ opacity: 1, flex: 1 }}
                  className="flex-1"
                >
                  <Input
                    label="Scheduled For (Date and Time)"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    required={isGrandTest}
                  />
                </motion.div>
              )}
            </div>
          </div>
          {/* --- 👆 END OF NEW FIELDS --- */}


          {/* Subjects Section */}
          <div className="pt-6 border-t border-white/20">
            <h3 className="text-lg font-semibold mb-3 text-cyan-400">
              Subjects & Difficulty Levels
            </h3>

            {subjects.map((s, i) => (
              <motion.div
                key={i}
                className="p-4 bg-white/5 rounded-xl border border-white/10 mb-3 shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <input
                    className="bg-transparent border-b border-white/30 focus:border-cyan-400 outline-none text-white w-1/2"
                    placeholder="Subject name"
                    value={s.name}
                    onChange={(e) => handleSubjectChange(i, "name", e.target.value)}
                  />
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(i)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      Remove ✕
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <InputMini
                    label="Easy"
                    type="number"
                    min="0"
                    value={s.easy}
                    onChange={(e) =>
                      handleSubjectChange(i, "easy", e.target.value)
                    }
                  />
                  <InputMini
                    label="Medium"
                    type="number"
                     min="0"
                    value={s.medium}
                    onChange={(e) =>
                      handleSubjectChange(i, "medium", e.target.value)
                    }
                  />
                  <InputMini
                    label="Hard"
                    type="number"
                     min="0"
                    value={s.hard}
                    onChange={(e) =>
                      handleSubjectChange(i, "hard", e.target.value)
                    }
                  />
                </div>
              </motion.div>
            ))}

            <button
              type="button"
              onClick={addSubject}
              className="mt-3 text-cyan-400 font-medium hover:underline"
            >
              + Add Subject
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition shadow-lg"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={(e) => onSubmit(e, true)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-900 font-semibold shadow-xl"
            >
              Save & Publish
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------ Small Input Components ------------------------ */

function Input({ label, ...props }) {
  return (
    <label className="flex flex-col space-y-1">
      <span className="text-sm text-gray-300">{label}</span>
      <input
        {...props}
        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400"
      />
    </label>
  );
}

function InputMini({ label, ...props }) {
  return (
    <label className="flex flex-col text-sm text-gray-300">
      {label}
      <input
        {...props}
        className="bg-white/10 border border-white/20 rounded-md px-2 py-1 focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400"
      />
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="flex flex-col space-y-1">
      <span className="text-sm text-gray-300">{label}</span>
      <textarea
        {...props}
        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400 h-24 resize-none"
      />
    </label>
  );
}