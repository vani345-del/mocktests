// frontend/src/components/admin/FormMocktest.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { createMockTest } from "../../redux/mockTestSlice";
import { useNavigate, useParams } from "react-router-dom";

// --- 燥 UPDATED: Defaults are now empty strings ---
const defaultSubject = { name: "", easy: "", medium: "", hard: "" };

export default function FormMocktest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { category } = useParams();

  // --- 燥 UPDATED: Numeric defaults are now empty strings ---
  const [form, setForm] = useState({
    category: category || "",
    subcategory: "",
    title: "",
    description: "",
    durationMinutes: "",
    totalQuestions: 0, // This is auto-calculated, so 0 is fine
    totalMarks: "",
    negativeMarking: "",
    price: "",
    discountPrice: "",
    isPublished: false,
  });

  const [isGrandTest, setIsGrandTest] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [subjects, setSubjects] = useState([{ ...defaultSubject }]);
  const [errors, setErrors] = useState({});

  // --- 燥 UPDATED: Store raw string value ---
  const handleSubjectChange = (i, key, value) => {
    const copy = [...subjects];
    copy[i][key] = value; // Store the value as-is (string)
    setSubjects(copy);
  };

  const addSubject = () => setSubjects([...subjects, { ...defaultSubject }]);
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));

  // --- 燥 UPDATED: More robust validation for empty strings vs. numeric values ---
  const validateForm = () => {
    const newErrors = {};
    const { 
      subcategory, title, description, durationMinutes, 
      totalMarks, negativeMarking, price, discountPrice 
    } = form;

    // Basic form validation
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!subcategory.trim()) newErrors.subcategory = "Subcategory is required.";
    if (!description.trim()) newErrors.description = "Description is required.";

    if (!durationMinutes.trim()) newErrors.durationMinutes = "Duration is required.";
    else if (Number(durationMinutes) <= 0) newErrors.durationMinutes = "Duration must be greater than 0.";

    if (!totalMarks.trim()) newErrors.totalMarks = "Total marks is required.";
    else if (Number(totalMarks) <= 0) newErrors.totalMarks = "Total marks must be greater than 0.";

    if (!negativeMarking.trim()) newErrors.negativeMarking = "Negative marking is required.";
    else if (Number(negativeMarking) < 0) newErrors.negativeMarking = "Negative marking cannot be negative.";

    if (!price.trim()) newErrors.price = "Price is required.";
    else if (Number(price) < 0) newErrors.price = "Price cannot be negative.";
    
    // Discount price is optional, but if present, must be valid
    if (discountPrice.trim() && Number(discountPrice) < 0) {
      newErrors.discountPrice = "Discount price cannot be negative.";
    } else if (Number(discountPrice) > 0 && Number(discountPrice) >= Number(price)) {
      newErrors.discountPrice = "Discount price must be less than the regular price.";
    }

    // Grand Test validation
    if (isGrandTest && !scheduledFor) {
      newErrors.scheduledFor = "Schedule date is required for a Grand Test.";
    }

    // Subjects validation
    const subjectErrors = [];
    if (subjects.length === 0) {
      newErrors.subjectsRoot = "At least one subject is required.";
    }
    
    let totalQ = 0;
    subjects.forEach((s, i) => {
      const subjectError = {};
      if (!s.name.trim()) {
        subjectError.name = "Subject name is required.";
      }
      
      const easy = Number(s.easy) || 0;
      const medium = Number(s.medium) || 0;
      const hard = Number(s.hard) || 0;
      const subjectTotal = easy + medium + hard;
      
      if (subjectTotal <= 0) {
         subjectError.questions = "Subject must have at least one question.";
      }
      totalQ += subjectTotal;

      if (Object.keys(subjectError).length > 0) {
        subjectErrors[i] = subjectError;
      }
    });

    if (subjectErrors.length > 0) {
      newErrors.subjects = subjectErrors;
    }
    
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, totalQuestions: totalQ };
  };

  const onSubmit = async (e, publish = false) => {
    e.preventDefault();
    
    const { isValid, totalQuestions } = validateForm();
    
    if (!isValid) {
      console.log("Form validation failed", errors);
      return; // Stop submission
    }

    // --- 燥 UPDATED: Cast subjects back to numbers ---
    const trimmedSubjects = subjects.map(s => ({
      name: s.name.trim(),
      easy: Number(s.easy) || 0,
      medium: Number(s.medium) || 0,
      hard: Number(s.hard) || 0
    }));

    // --- 燥 UPDATED: Cast form fields back to numbers ---
    const payload = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
      totalMarks: Number(form.totalMarks),
      negativeMarking: Number(form.negativeMarking),
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0, // Default to 0 if empty
      subjects: trimmedSubjects,
      isPublished: publish,
      isGrandTest: isGrandTest,
      scheduledFor: isGrandTest ? scheduledFor : null,
      totalQuestions: totalQuestions // Use the count from validation
    };

    try {
      const resultAction = await dispatch(createMockTest(payload));
      if (createMockTest.fulfilled.match(resultAction)) {
        const id = resultAction.payload._id;
        navigate(`/admin/mocktests/${id}/new/questions`);
      } else {
        console.error("Failed to create mock test:", resultAction.payload);
        setErrors({ form: "Failed to create mock test. Please try again." });
      }
    } catch (err) {
      console.error(err);
      setErrors({ form: "An unexpected error occurred." });
    }
  };
  
  const displayError = errors.form ? <div className="text-red-400 text-center mb-4">{errors.form}</div> : null;
  
  // --- 燥 UPDATED: General handler for string inputs ---
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        
        {displayError}

        <form onSubmit={(e) => onSubmit(e, false)} className="space-y-6">
          {/* Category & Subcategory */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={handleFormChange}
              error={errors.category}
              disabled 
            />
            <Input
              label="Subcategory"
              name="subcategory"
              value={form.subcategory}
              onChange={handleFormChange}
              error={errors.subcategory}
            />
          </div>

          {/* Title */}
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleFormChange}
            error={errors.title}
          />

          {/* Description */}
          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleFormChange}
            error={errors.description}
          />

          {/* Marks & Duration */}
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              name="durationMinutes"
              min="0"
              value={form.durationMinutes}
              onChange={handleFormChange}
              error={errors.durationMinutes}
            />
            <Input
              label="Total Marks"
              type="number"
              name="totalMarks"
              min="0"
              value={form.totalMarks}
              onChange={handleFormChange}
              error={errors.totalMarks}
            />
            <Input
              label="Negative Marking (per question)"
              type="number"
              name="negativeMarking"
              step="0.01"
              value={form.negativeMarking}
              onChange={handleFormChange}
              error={errors.negativeMarking}
            />
          </div>

          {/* Price Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              name="price"
              min="0"
              value={form.price}
              onChange={handleFormChange}
              error={errors.price}
            />
            <Input
              label="Discount Price"
              type="number"
              name="discountPrice"
              min="0"
              value={form.discountPrice}
              onChange={handleFormChange}
              error={errors.discountPrice}
            />
          </div>
          
          {/* NEW GRAND TEST FIELDS */}
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
                    error={errors.scheduledFor}
                  />
                </motion.div>
              )}
            </div>
          </div>
          {/* END OF NEW FIELDS */}


          {/* Subjects Section */}
          <div className="pt-6 border-t border-white/20">
            <h3 className="text-lg font-semibold mb-3 text-cyan-400">
              Subjects & Difficulty Levels
            </h3>
            {errors.subjectsRoot && <p className="text-red-400 text-sm mb-2">{errors.subjectsRoot}</p>}

            {subjects.map((s, i) => (
              <motion.div
                key={i}
                className="p-4 bg-white/5 rounded-xl border border-white/10 mb-3 shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-1/2">
                    <input
                      className="bg-transparent border-b border-white/30 focus:border-cyan-400 outline-none text-white w-full"
                      placeholder="Subject name"
                      value={s.name}
                      onChange={(e) => handleSubjectChange(i, "name", e.target.value)}
                    />
                    {errors.subjects?.[i]?.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.subjects[i].name}</p>
                    )}
                  </div>
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(i)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      Remove 笨                    </button>
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
                 {errors.subjects?.[i]?.questions && (
                  <p className="text-red-400 text-xs mt-2">{errors.subjects[i].questions}</p>
                )}
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

function Input({ label, error, ...props }) {
  return (
    <label className="flex flex-col space-y-1">
      <span className="text-sm text-gray-300">{label}</span>
      <input
        {...props}
        className={`bg-white/10 border ${
          error ? "border-red-400" : "border-white/20"
        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-400" : "focus:ring-cyan-400"
        } text-white placeholder-gray-400`}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
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

function Textarea({ label, error, ...props }) {
  return (
    <label className="flex flex-col space-y-1">
      <span className="text-sm text-gray-300">{label}</span>
      <textarea
        {...props}
        className={`bg-white/10 border ${
          error ? "border-red-400" : "border-white/20"
        } rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-400" : "focus:ring-cyan-400"
        } text-white placeholder-gray-400 h-24 resize-none`}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </label>
  );
}