// frontend/src/components/admin/AdminQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

/* -----------------------------------------------
   INITIAL CHILD QUESTION STRUCTURE
------------------------------------------------*/
const initialOption = { text: "", imageFile: null };
const initialChild = () => ({
  title: "",
  options: [
    { ...initialOption },
    { ...initialOption },
    { ...initialOption },
    { ...initialOption }
  ],
  correctIndex: 0,
  marks: 1,
  negative: 0,
  difficulty: "easy",
});

/* -----------------------------------------------
    INITIAL FORM STATE
------------------------------------------------*/
const getInitialFormState = (defaultCategory) => ({
  questionType: "mcq",
  title: "",
  options: [
    { text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
    { text: "" }
  ],
  correct: [],
  correctManualAnswer: "",
  marks: 1,
  negative: 0,
  difficulty: "easy",
  category: defaultCategory || "",
  parentQuestionId: "",
});

export default function AdminQuestions() {
  const { id } = useParams(); // mocktest id param
  const navigate = useNavigate();

  /* STATES */
  const [mocktest, setMocktest] = useState(null);
  const [form, setForm] = useState(getInitialFormState(""));
  const [questionImageFile, setQuestionImageFile] = useState(null);
  const [optionImageFiles, setOptionImageFiles] = useState([null, null, null, null, null]);
  const [children, setChildren] = useState([initialChild()]); // default 1 child
  const [passages, setPassages] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -----------------------------------------------
      LOAD MOCKTEST DATA
  ------------------------------------------------*/
  useEffect(() => {
    const loadMocktest = async () => {
      try {
        // Note: backend mocktest router is mounted at /api/admin/mocktests
        const res = await api.get(`/api/admin/mocktests/${id}`);
        setMocktest(res.data);

        const defaultSubject = res.data?.subjects?.[0]?.name || "";
        setForm(getInitialFormState(defaultSubject));

        if (defaultSubject) fetchPassages(defaultSubject);
      } catch (err) {
        console.error("loadMocktest error:", err.response?.data || err);
        toast.error("Failed to load mocktest.");
      }
    };
    loadMocktest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* -----------------------------------------------
      FETCH PASSAGES FOR DROPDOWN
      (route exposed at /api/admin/categories/questions/passages)
  ------------------------------------------------*/
  const fetchPassages = async (category) => {
    try {
      const res = await api.get(
        `/api/admin/categories/questions/passages?category=${encodeURIComponent(category)}`
      );
      setPassages(res.data.passages || []);
    } catch (err) {
      console.error("fetchPassages error:", err.response?.data || err);
      // silent fail (not blocking)
    }
  };

  useEffect(() => {
    if (form.category) fetchPassages(form.category);
  }, [form.category]);

  /* -----------------------------------------------
      ADD SINGLE QUESTION (MCQ / MANUAL)
  ------------------------------------------------*/
  const onAddQuestion = async (e) => {
    e.preventDefault();

    if (!form.category.trim()) return toast.error("Please select subject.");
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

    if (form.parentQuestionId) fd.append("parentQuestionId", form.parentQuestionId);
    if (questionImageFile) fd.append("questionImage", questionImageFile);

    if (form.questionType === "mcq") {
      fd.append("options", JSON.stringify(form.options.map((o) => ({ text: o.text }))));
      fd.append("correct", JSON.stringify(form.correct || []));
      optionImageFiles.forEach((file, i) => {
        if (file) fd.append(`optionImage${i}`, file);
      });
    } else if (form.questionType === "manual") {
      fd.append("correctManualAnswer", form.correctManualAnswer);
    }

    const toastId = toast.loading("Adding question...");
    setIsSubmitting(true);

    try {
      // Add directly to the mocktest
      await api.post(`/api/admin/mocktests/${id}/questions`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Question added!", { id: toastId });
      resetForm();
      if (form.category) fetchPassages(form.category);
    } catch (err) {
      console.error("onAddQuestion error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Add failed", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -----------------------------------------------
     ADD PASSAGE + MULTIPLE CHILD QUESTIONS (DEFAULT MIN 1)
  ------------------------------------------------*/
  const onAddPassageWithChildren = async (e) => {
    e.preventDefault();

    if (!form.category.trim()) return toast.error("Select category for this passage.");
    if (!form.title.trim()) return toast.error("Passage text required.");

    // Validation: each child must have text and >=2 non-empty options
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (!c.title.trim()) return toast.error(`Child #${i + 1} text required.`);
      const nonEmpty = c.options.filter((o) => (o.text && o.text.trim()) || o.imageFile).length;
      if (nonEmpty < 2) return toast.error(`Child #${i + 1} must have at least 2 options.`);
      if (typeof c.correctIndex === "undefined" || c.correctIndex === null) return toast.error(`Select correct option for child #${i + 1}.`);
    }

    const fd = new FormData();
    fd.append("passageTitle", form.title);
    fd.append("category", form.category);
    fd.append("difficulty", form.difficulty);

    // send children metadata
    fd.append(
      "children",
      JSON.stringify(
        children.map((c) => ({
          title: c.title,
          options: c.options.map((o) => o.text || ""),
          correctIndex: c.correctIndex,
          marks: c.marks,
          negative: c.negative,
          difficulty: c.difficulty
        }))
      )
    );

    // passage image
    if (questionImageFile) fd.append("passageImage", questionImageFile);

    // append child option image files: child_{i}_optionImage{j}
    children.forEach((c, i) => {
      c.options.forEach((opt, j) => {
        if (opt.imageFile) fd.append(`child_${i}_optionImage${j}`, opt.imageFile);
      });
    });

    const toastId = toast.loading("Adding passage...");
    setIsSubmitting(true);

    try {
      // backend route mounted: POST /api/admin/mocktests/:id/questions/passage-bulk
      await api.post(`/api/admin/mocktests/${id}/questions/passage-bulk`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Passage + MCQs added!", { id: toastId });
      resetForm();
      if (form.category) fetchPassages(form.category);
    } catch (err) {
      console.error("onAddPassageWithChildren error:", err.response?.data || err);
      toast.error("Failed to add passage.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -----------------------------------------------
      RESET FORM
  ------------------------------------------------*/
  const resetForm = () => {
    const defaultSubject = mocktest?.subjects?.[0]?.name || "";
    setForm(getInitialFormState(defaultSubject));
    setQuestionImageFile(null);
    setOptionImageFiles([null, null, null, null, null]);
    setChildren([initialChild()]); // reset to single child again
    // reset any file input DOM values if needed (optional)
    const qEl = document.getElementById("question-image-input");
    if (qEl) qEl.value = "";
    for (let i = 0; i < 5; i++) {
      const el = document.getElementById(`option-image-input-${i}`);
      if (el) el.value = "";
    }
  };

  /* -----------------------------------------------
      CHILD HELPERS (default: min 1)
  ------------------------------------------------*/
  const addChild = () => setChildren((prev) => [...prev, initialChild()]);
  const removeChild = (i) =>
    setChildren((prev) => {
      if (prev.length <= 1) return prev; // prevent removing last child
      return prev.filter((_, idx) => idx !== i);
    });
  const updateChild = (i, patch) =>
    setChildren((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const updateChildOptText = (ci, oi, text) =>
    setChildren((prev) =>
      prev.map((c, idx) =>
        idx === ci ? { ...c, options: c.options.map((o, j) => (j === oi ? { ...o, text } : o)) } : c
      )
    );

  const updateChildOptFile = (ci, oi, file) =>
    setChildren((prev) =>
      prev.map((c, idx) =>
        idx === ci ? { ...c, options: c.options.map((o, j) => (j === oi ? { ...o, imageFile: file } : o)) } : c
      )
    );

  /* -----------------------------------------------
      RENDER UI
  ------------------------------------------------*/
  return (
    <div className="min-h-screen bg-slate-900 py-10 text-white">
      <motion.div
        className="max-w-5xl mx-auto bg-white/10 p-8 rounded-xl border border-white/20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate(-1)} className="text-cyan-400 mb-4 flex items-center gap-2">
          <FaArrowLeft /> Back
        </button>

        <h2 className="text-3xl font-bold text-center mb-6">Manage Questions</h2>

        <form
          onSubmit={form.questionType === "passage" ? onAddPassageWithChildren : onAddQuestion}
          className="space-y-6 bg-black/10 p-6 rounded-xl"
        >
          {/* Subject, Difficulty, Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Subject"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={(mocktest?.subjects || []).map((s) => ({ value: s.name, label: s.name }))}
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
                { value: "passage", label: "Passage + Multiple Questions" },
              ]}
            />
          </div>

          {/* Image Upload */}
          <input
            id="question-image-input"
            type="file"
            accept="image/*"
            onChange={(e) => setQuestionImageFile(e.target.files[0])}
            className="file-input w-full"
          />

          <Textarea
            label={form.questionType === "passage" ? "Passage Text" : "Question Text"}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {/* -----------------------------------------
               MCQ SINGLE QUESTION OPTIONS
          ------------------------------------------*/}
          {form.questionType === "mcq" && (
            <div>
              <p className="text-sm mb-2">Options</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {form.options.map((opt, i) => (
                  <div key={i} className="bg-white/10 p-3 rounded">
                    <label className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={form.correct.includes(i)}
                        onChange={() => {
                          const arr = form.correct.includes(i) ? form.correct.filter((x) => x !== i) : [...form.correct, i];
                          setForm({ ...form, correct: arr });
                        }}
                      />
                      Correct?
                    </label>

                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt.text}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          options: form.options.map((o, j) => (j === i ? { ...o, text: e.target.value } : o)),
                        })
                      }
                    />

                    <input
                      id={`option-image-input-${i}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setOptionImageFiles(optionImageFiles.map((f, j) => (j === i ? e.target.files[0] : f)))}
                      className="file-input mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -----------------------------------------
               PASSAGE + CHILD MCQs
          ------------------------------------------*/}
          {form.questionType === "passage" && (
            <div className="bg-white/10 p-4 rounded">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-sm">Child Questions</p>
                <button type="button" onClick={addChild} className="bg-green-600 px-4 py-1 rounded">Add Child</button>
              </div>

              {/* Render Child Questions */}
              {children.map((c, ci) => (
                <div key={ci} className="p-3 mb-4 border border-white/20 rounded">
                  <div className="flex justify-between mb-2">
                    <strong>Child #{ci + 1}</strong>
                    {/* Hide Remove if only 1 child left */}
                    {children.length > 1 ? (
                      <button type="button" onClick={() => removeChild(ci)} className="text-red-400">Remove</button>
                    ) : (
                      <span className="text-xs text-gray-400">Minimum 1 child</span>
                    )}
                  </div>

                  <Input label="Question Text" value={c.title} onChange={(e) => updateChild(ci, { title: e.target.value })} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {c.options.map((opt, oi) => (
                      <div key={oi} className="bg-white/5 p-2 rounded">
                        <Input placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt.text} onChange={(e) => updateChildOptText(ci, oi, e.target.value)} />

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => updateChildOptFile(ci, oi, e.target.files[0])}
                          className="file-input mt-2"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 items-center mt-2">
                    <span className="text-sm">Correct:</span>
                    {c.options.map((_, oi) => (
                      <label key={oi} className="flex items-center gap-1">
                        <input type="radio" checked={c.correctIndex === oi} name={`child_${ci}_correct`} onChange={() => updateChild(ci, { correctIndex: oi })} />
                        {String.fromCharCode(65 + oi)}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Marks / Negative */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marks" type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} />
            <Input label="Negative" type="number" value={form.negative} onChange={(e) => setForm({ ...form, negative: Number(e.target.value) })} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 text-black py-3 rounded-lg font-bold">
            {isSubmitting ? <ClipLoader size={20} /> : form.questionType === "passage" ? "Add Passage + Children" : "Add Question"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* -----------------------------------------------
   SMALL INPUT COMPONENTS
------------------------------------------------*/
const Input = ({ label, ...props }) => (
  <label className="text-sm flex flex-col mb-2">
    {label && <span className="mb-1">{label}</span>}
    <input {...props} className="px-3 py-2 bg-white/10 rounded" />
  </label>
);

const Select = ({ label, options, ...props }) => (
  <label className="text-sm flex flex-col mb-2">
    {label && <span className="mb-1">{label}</span>}
    <select {...props} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-600">
      {options.map((opt, i) => (
        <option key={i} className="bg-slate-900 text-white" value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </label>
);

const Textarea = ({ label, ...props }) => (
  <label className="text-sm flex flex-col mb-2">
    {label && <span className="mb-1">{label}</span>}
    <textarea {...props} className="px-3 py-2 bg-white/10 rounded h-24"></textarea>
  </label>
);
