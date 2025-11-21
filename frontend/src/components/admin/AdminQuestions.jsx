// frontend/src/components/admin/AdminQuestions.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaUpload,
  FaBook,
  FaFeatherAlt,
  FaFileAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";

/* -----------------------------------------------
    INITIAL CHILD QUESTION STRUCTURE
------------------------------------------------*/
const initialOption = { text: "", imageFile: null };
const initialChild = () => ({
  title: "",
  options: [{ ...initialOption }, { ...initialOption }, { ...initialOption }, { ...initialOption }],
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
  options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }, { text: "" }],
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
  const [bulkFile, setBulkFile] = useState(null); // State for bulk file
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentMode, setCurrentMode] = useState("manual"); // 'manual' | 'bulk'
  const bulkInputRef = useRef(null);

  /* -----------------------------------------------
      LOAD MOCKTEST DATA
  ------------------------------------------------*/
  useEffect(() => {
    const loadMocktest = async () => {
      try {
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
  ------------------------------------------------*/
  const fetchPassages = async (category) => {
    try {
        const res = await api.get(`/api/admin/mocktests/categories/questions/passages?category=${category}`);
      setPassages(res.data.passages || []);
    } catch (err) {
      console.error("fetchPassages error:", err.response?.data || err);
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
      ADD PASSAGE + MULTIPLE CHILD QUESTIONS
  ------------------------------------------------*/
  const onAddPassageWithChildren = async (e) => {
    e.preventDefault();

    if (!form.category.trim()) return toast.error("Select category for this passage.");
    if (!form.title.trim()) return toast.error("Passage text required.");

    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (!c.title.trim()) return toast.error(`Child #${i + 1} text required.`);
      const nonEmpty = c.options.filter((o) => (o.text && o.text.trim()) || o.imageFile).length;
      if (nonEmpty < 2) return toast.error(`Child #${i + 1} must have at least 2 options.`);
      if (typeof c.correctIndex === "undefined" || c.correctIndex === null)
        return toast.error(`Select correct option for child #${i + 1}.`);
    }

    const fd = new FormData();
    fd.append("passageTitle", form.title);
    fd.append("category", form.category);
    fd.append("difficulty", form.difficulty);

    fd.append(
      "children",
      JSON.stringify(
        children.map((c) => ({
          title: c.title,
          options: c.options.map((o) => o.text || ""),
          correctIndex: c.correctIndex,
          marks: c.marks,
          negative: c.negative,
          difficulty: c.difficulty,
        }))
      )
    );

    if (questionImageFile) fd.append("passageImage", questionImageFile);

    children.forEach((c, i) => {
      c.options.forEach((opt, j) => {
        if (opt.imageFile) fd.append(`child_${i}_optionImage${j}`, opt.imageFile);
      });
    });

    const toastId = toast.loading("Adding passage...");
    setIsSubmitting(true);

    try {
      await api.post(`/api/admin/mocktests/${id}/questions/passage-bulk`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
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
      BULK UPLOAD HANDLER (TO MOCKTEST ONLY)
  ------------------------------------------------*/
  const onBulkUpload = async (e) => {
    e.preventDefault();

    if (!bulkFile) return toast.error("Please select a file to upload.");

    // Validate size (<= 10 MB)
    const MAX_BYTES = 10 * 1024 * 1024;
    if (bulkFile.size > MAX_BYTES) return toast.error("File is too large. Maximum 10MB allowed.");

    // Validate extension
    const allowed = [".csv", ".xlsx", ".xls"];
    const name = bulkFile.name.toLowerCase();
    if (!allowed.some((ext) => name.endsWith(ext))) {
      return toast.error("Invalid file type. Use .csv, .xlsx or .xls");
    }

    const fd = new FormData();
    fd.append("file", bulkFile);

    const toastId = toast.loading("Processing bulk upload...");
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      await api.post(`/api/admin/mocktests/${id}/questions/bulk-upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.lengthComputable) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      toast.success("Bulk questions uploaded successfully! Processing may take a moment.", { id: toastId });
      setBulkFile(null);
      setUploadProgress(0);
      if (bulkInputRef.current) bulkInputRef.current.value = "";
      // Optionally reload mocktest details / question counts
      try {
        const res = await api.get(`/api/admin/mocktests/${id}`);
        setMocktest(res.data);
      } catch (err) {
        // ignore fetch failure
      }
    } catch (err) {
      console.error("onBulkUpload error:", err.response?.data || err);
      // Prefer server-provided message
      const msg = err.response?.data?.message || err.response?.data || "Bulk upload failed.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
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
    setChildren([initialChild()]);
    // Reset file inputs
    const qEl = document.getElementById("question-image-input");
    if (qEl) qEl.value = "";
    for (let i = 0; i < 5; i++) {
      const el = document.getElementById(`option-image-input-${i}`);
      if (el) el.value = "";
    }
    if (bulkInputRef.current) bulkInputRef.current.value = "";
  };

  /* -----------------------------------------------
      CHILD HELPERS (default: min 1)
  ------------------------------------------------*/
  const addChild = () => setChildren((prev) => [...prev, initialChild()]);
  const removeChild = (i) =>
    setChildren((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== i);
    });
  const updateChild = (i, patch) => setChildren((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const updateChildOptText = (ci, oi, text) =>
    setChildren((prev) => prev.map((c, idx) => (idx === ci ? { ...c, options: c.options.map((o, j) => (j === oi ? { ...o, text } : o)) } : c)));
  const updateChildOptFile = (ci, oi, file) =>
    setChildren((prev) => prev.map((c, idx) => (idx === ci ? { ...c, options: c.options.map((o, j) => (j === oi ? { ...o, imageFile: file } : o)) } : c)));

  /* -----------------------------------------------
      RENDER UI
  ------------------------------------------------*/
  const currentFormHandler =
    currentMode === "bulk" ? onBulkUpload : form.questionType === "passage" ? onAddPassageWithChildren : onAddQuestion;
  const isPassageOrSingleMode = currentMode === "manual";
  const isSingleQuestion = isPassageOrSingleMode && form.questionType !== "passage";
  const isPassageQuestion = isPassageOrSingleMode && form.questionType === "passage";

  return (
    <div className="min-h-screen bg-slate-900 py-10 text-white">
      <motion.div className="max-w-5xl mx-auto bg-white/10 p-8 rounded-xl border border-white/20 shadow-2xl" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="text-cyan-400 mb-4 flex items-center gap-2 font-medium transition hover:text-cyan-300">
          <FaArrowLeft /> Back to Mocktest Details
        </button>

        <h2 className="text-4xl font-extrabold text-center mb-6 tracking-tight">Manage Questions</h2>

        {/* MODE TABS */}
        <div className="flex bg-black/20 p-1 rounded-xl mb-6 shadow-inner">
          <TabButton icon={FaFeatherAlt} label="Manual Entry" isActive={currentMode === "manual"} onClick={() => setCurrentMode("manual")} />
          <TabButton icon={FaUpload} label="Bulk Upload (.xlsx/.csv)" isActive={currentMode === "bulk"} onClick={() => setCurrentMode("bulk")} />
        </div>

        {/* MAIN FORM */}
        <form onSubmit={currentFormHandler} className="space-y-6 bg-black/10 p-6 rounded-xl border border-white/5">
          {/* BULK MODE */}
          {currentMode === "bulk" && (
            <BulkUploadForm
              bulkFile={bulkFile}
              setBulkFile={setBulkFile}
              isSubmitting={isSubmitting}
              uploadProgress={uploadProgress}
              bulkInputRef={bulkInputRef}
            />
          )}

          {/* MANUAL MODE */}
          {currentMode === "manual" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Subject" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={(mocktest?.subjects || []).map((s) => ({ value: s.name, label: s.name }))} />
                <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} options={[{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }]} />
                <Select label="Question Type" value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value })} options={[{ value: "mcq", label: "Multiple Choice" }, { value: "manual", label: "Manual Input/Integer" }, { value: "passage", label: "Passage + Multiple Questions" }]} />
              </div>

              <InputFile id="question-image-input" label={isPassageQuestion ? "Passage Image (Optional)" : "Question Image (Optional)"} onChange={(e) => setQuestionImageFile(e.target.files[0])} />

              <Textarea label={isPassageQuestion ? "Passage Text" : "Question Text"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

              {isSingleQuestion && form.questionType === "mcq" && <SingleMCQOptions form={form} setForm={setForm} optionImageFiles={optionImageFiles} setOptionImageFiles={setOptionImageFiles} />}

              {isSingleQuestion && form.questionType === "manual" && <Input label="Correct Manual Answer (e.g., 42, yes, 3.14)" value={form.correctManualAnswer} onChange={(e) => setForm({ ...form, correctManualAnswer: e.target.value })} />}

              {isPassageQuestion && <PassageChildQuestions children={children} addChild={addChild} removeChild={removeChild} updateChild={updateChild} updateChildOptText={updateChildOptText} updateChildOptFile={updateChildOptFile} />}

              <div className="grid grid-cols-2 gap-3">
                <Input label="Marks" type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} />
                <Input label="Negative Marking" type="number" value={form.negative} onChange={(e) => setForm({ ...form, negative: Number(e.target.value) })} />
              </div>
            </>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 text-black py-3 rounded-lg font-bold transition duration-200 hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center">
            {isSubmitting ? <ClipLoader size={20} color="#000" /> : isPassageQuestion ? "Add Passage + Children" : currentMode === "bulk" ? "Start Bulk Upload" : "Add Single Question"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* -----------------------------------------------
    BULK UPLOAD COMPONENT (IMPROVED)
------------------------------------------------*/
const BulkUploadForm = ({ bulkFile, setBulkFile, isSubmitting, uploadProgress, bulkInputRef }) => {
  // Use the local uploaded file path as template href (developer requested path usage)
  // Note: the runtime environment may transform this path to a served URL.
  const templateHref = "sandbox:/mnt/data/WriteMocktest.jsx"; // developer-provided local path (will be transformed)

  return (
    <div className="space-y-4 p-4 border border-blue-500/50 bg-blue-900/10 rounded-xl">
      <div className="flex items-center gap-3">
        <FaUpload className="text-blue-400 text-xl" />
        <h3 className="text-lg font-semibold">Upload Question File</h3>
      </div>

      <p className="text-sm text-gray-300">
        Prepare your questions in the standardized spreadsheet format (.xlsx or .csv). The upload will add questions directly to this mocktest.
      </p>

      <label htmlFor="bulk-file-input" className="text-sm flex flex-col mb-2">
        <span className="mb-1 font-medium">Select Spreadsheet File (Max 10MB)</span>
        <input
          id="bulk-file-input"
          ref={bulkInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={(e) => setBulkFile(e.target.files[0])}
          className="file:bg-cyan-500 file:text-black file:font-semibold file:py-2 file:px-4 file:rounded-lg file:border-0 file:mr-4 file:cursor-pointer bg-white/10 text-gray-300 rounded-lg p-2 transition"
        />
      </label>

      {bulkFile && <p className="text-sm text-green-400">File selected: <strong>{bulkFile.name}</strong> ({Math.round(bulkFile.size / 1024)} KB)</p>}

      {uploadProgress > 0 && (
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div style={{ width: `${uploadProgress}%` }} className="h-full bg-cyan-400 transition-all" />
        </div>
      )}

      <a href={templateHref} target="_blank" rel="noreferrer" className="text-cyan-400 text-sm font-medium flex items-center gap-2 hover:text-cyan-300">
        <FaFileAlt /> Download CSV/XLSX Template
      </a>

      <p className="text-xs text-gray-400 mt-1">Accepted: .csv, .xlsx, .xls — Max 10MB</p>
    </div>
  );
};

/* -----------------------------------------------
    CHILD & SMALL UI COMPONENTS
------------------------------------------------*/
const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button type="button" onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${isActive ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30" : "text-gray-300 hover:bg-white/5"}`}>
    <Icon />
    <span className="truncate">{label}</span>
  </button>
);

const SingleMCQOptions = ({ form, setForm, optionImageFiles, setOptionImageFiles }) => (
  <div>
    <p className="text-sm mb-2 font-medium flex items-center gap-2"><FaQuestionCircle className="text-cyan-400" /> Options (Select Correct)</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {form.options.map((opt, i) => (
        <div key={i} className="bg-white/10 p-3 rounded border border-white/5">
          <label className="flex gap-2 items-center mb-2">
            <input
              type="checkbox"
              checked={form.correct.includes(i)}
              onChange={() => {
                const arr = form.correct.includes(i) ? form.correct.filter((x) => x !== i) : [...form.correct, i];
                setForm({ ...form, correct: arr });
              }}
              className="form-checkbox text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500 rounded"
            />
            Correct Option
          </label>

          <Input placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt.text} onChange={(e) => setForm({ ...form, options: form.options.map((o, j) => (j === i ? { ...o, text: e.target.value } : o)) })} />

          <InputFile id={`option-image-input-${i}`} label="Image (Optional)" onChange={(e) => setOptionImageFiles(optionImageFiles.map((f, j) => (j === i ? e.target.files[0] : f)))} />
        </div>
      ))}
    </div>
  </div>
);

const PassageChildQuestions = ({ children, addChild, removeChild, updateChild, updateChildOptText, updateChildOptFile }) => (
  <div className="bg-white/10 p-4 rounded border border-white/5">
    <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
      <p className="font-semibold text-lg">Child Questions</p>
      <button type="button" onClick={addChild} className="bg-green-600 hover:bg-green-500 px-4 py-1 rounded transition">Add Child</button>
    </div>

    {children.map((c, ci) => (
      <motion.div key={ci} className="p-3 mb-4 border border-white/20 rounded shadow-inner bg-black/20" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
        <div className="flex justify-between mb-2">
          <strong className="text-cyan-400">Child #{ci + 1}</strong>
          {children.length > 1 ? <button type="button" onClick={() => removeChild(ci)} className="text-red-400 hover:text-red-300">Remove</button> : <span className="text-xs text-gray-400">Minimum 1 child</span>}
        </div>

        <Input label="Question Text" value={c.title} onChange={(e) => updateChild(ci, { title: e.target.value })} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {c.options.map((opt, oi) => (
            <div key={oi} className="bg-white/5 p-2 rounded">
              <Input placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt.text} onChange={(e) => updateChildOptText(ci, oi, e.target.value)} />
              <InputFile label="Image (Optional)" onChange={(e) => updateChildOptFile(ci, oi, e.target.files[0])} />
            </div>
          ))}
        </div>

        <div className="flex gap-3 items-center mt-2 p-2 bg-white/5 rounded">
          <span className="text-sm font-medium">Correct Option:</span>
          {c.options.map((_, oi) => (
            <label key={oi} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={c.correctIndex === oi} name={`child_${ci}_correct`} onChange={() => updateChild(ci, { correctIndex: oi })} className="form-radio text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500" />
              {String.fromCharCode(65 + oi)}
            </label>
          ))}
        </div>
      </motion.div>
    ))}
  </div>
);

/* -----------------------------------------------
    SMALL INPUT COMPONENTS
------------------------------------------------*/
const Input = ({ label, ...props }) => (
  <label className="text-sm flex flex-col mb-2">
    {label && <span className="mb-1 font-medium">{label}</span>}
    <input {...props} className="px-3 py-2 bg-white/10 rounded border border-white/5 focus:border-cyan-500 transition" />
  </label>
);

const Select = ({ label, options, ...props }) => (
  <label className="text-sm flex flex-col mb-2">
    {label && <span className="mb-1 font-medium">{label}</span>}
    <select {...props} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:border-cyan-500 transition">
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
    {label && <span className="mb-1 font-medium">{label}</span>}
    <textarea {...props} className="px-3 py-2 bg-white/10 rounded h-24 border border-white/5 focus:border-cyan-500 transition"></textarea>
  </label>
);

const InputFile = ({ label, id, ...props }) => (
  <label htmlFor={id} className="text-sm flex flex-col mb-2">
    {label && <span className="mb-1 font-medium">{label}</span>}
    <input
      id={id}
      type="file"
      accept="image/*"
      {...props}
      className="file:bg-cyan-500 file:text-black file:font-semibold file:py-2 file:px-4 file:rounded-lg file:border-0 file:mr-4 file:cursor-pointer bg-white/10 text-gray-300 rounded-lg p-2 transition"
    />
  </label>
);
