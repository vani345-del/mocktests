// frontend/src/components/admin/FormMocktest.jsx - UPDATED
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMockTestByIdForEdit,
    updateMockTest,
} from "../../redux/mockTestSlice";
import { useNavigate, useParams } from "react-router-dom";
import { FaUpload, FaPlusCircle, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";

const defaultSubject = { name: "", easy: "", medium: "", hard: "" };

// ✅ FIX: Assign default no-op function to onSubmitHandler
export default function FormMocktest({ onSubmitHandler = () => {}, initialData, formTitle }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { category, id } = useParams();
    const isEditMode = Boolean(id);

    // === NEW STATES (Thumbnail + Free) ===
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [isFree, setIsFree] = useState(false);
    // =====================================

    const {
        selectedMocktest: currentMocktest,
        selectedStatus,
        selectedError
    } = useSelector((state) => state.mocktest);

    const sliceLoading = selectedStatus === "loading";
    const sliceError = selectedError;

    const [form, setForm] = useState({
        // Use initialData for safe defaults
        category: category || initialData?.category || "",
        subcategory: "",
        title: "",
        description: "",
        durationMinutes: "",
        totalQuestions: 0,
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

    // --- EFFECT 1: Fetch data if in Edit Mode ---
    useEffect(() => {
        if (isEditMode) {
            dispatch(fetchMockTestByIdForEdit(id));
        }
    }, [dispatch, id, isEditMode]);

    // --- EFFECT 2: Populate form when data arrives ---
    useEffect(() => {
        if (isEditMode && currentMocktest) {
            setForm({
                category: currentMocktest.category?._id || category,
                subcategory: currentMocktest.subcategory || "",
                title: currentMocktest.title || "",
                description: currentMocktest.description || "",
                durationMinutes: currentMocktest.durationMinutes?.toString() || "",
                negativeMarking: currentMocktest.negativeMarking?.toString() || "",
                totalQuestions: currentMocktest.totalQuestions || 0,
                totalMarks: currentMocktest.totalMarks?.toString() || "",
                price: currentMocktest.price?.toString() || "",
                discountPrice: currentMocktest.discountPrice?.toString() || "",
                isPublished: currentMocktest.isPublished || false,

            });

            // ✅ PATCH 2: Load existing FREE + THUMBNAIL
            setIsFree(currentMocktest.isFree || false);
            if (currentMocktest.thumbnail) {
                setThumbnailPreview(currentMocktest.thumbnail);
            }

            if (
                Array.isArray(currentMocktest.subjects) &&
                currentMocktest.subjects.length > 0
            ) {
                setSubjects(
                    currentMocktest.subjects.map((s) => ({
                        name: s.name || "",
                        easy: s.easy?.toString() || "",
                        medium: s.medium?.toString() || "",
                        hard: s.hard?.toString() || "",
                    }))
                );
            } else {
                setSubjects([{ ...defaultSubject }]);
            }

            setIsGrandTest(currentMocktest.isGrandTest || false);

            setScheduledFor(
                currentMocktest.scheduledFor
                    ? new Date(currentMocktest.scheduledFor).toISOString().slice(0, 16)
                    : ""
            );
        }
    }, [isEditMode, currentMocktest, category]);
    // --- END OF EFFECTS ---

    const handleSubjectChange = (i, key, value) => {
        const copy = [...subjects];
        copy[i][key] = value;
        setSubjects(copy);
    };

    const addSubject = () => setSubjects([...subjects, { ...defaultSubject }]);
    const removeSubject = (i) =>
        setSubjects(subjects.filter((_, idx) => idx !== i));

    const validateForm = () => {
        const newErrors = {};
        const {
            subcategory,
            title,
            description,
            durationMinutes,
            totalMarks,
            negativeMarking,
            price,
            discountPrice,
        } = form;

        if (!title.trim()) newErrors.title = "Title is required.";
        if (!subcategory.trim()) newErrors.subcategory = "Subcategory is required.";
        if (!description.trim()) newErrors.description = "Description is required.";

        if (!durationMinutes.trim())
            newErrors.durationMinutes = "Duration is required.";
        else if (Number(durationMinutes) <= 0)
            newErrors.durationMinutes = "Duration must be > 0.";

        if (!totalMarks.trim()) newErrors.totalMarks = "Total marks is required.";
        else if (Number(totalMarks) <= 0)
            newErrors.totalMarks = "Total marks must be > 0.";

        if (negativeMarking.trim() === "")
            newErrors.negativeMarking = "Negative marking is required.";
        else if (Number(negativeMarking) < 0)
            newErrors.negativeMarking = "Cannot be negative.";

        // Validate price fields only if the test is NOT free
        if (!isFree) {
            if (!price.trim()) newErrors.price = "Price is required.";
            else if (Number(price) < 0) newErrors.price = "Price cannot be negative.";

            if (discountPrice.trim() && Number(discountPrice) < 0) {
                newErrors.discountPrice = "Cannot be negative.";
            } else if (
                discountPrice.trim() &&
                Number(price) > 0 &&
                Number(discountPrice) >= Number(price)
            ) {
                newErrors.discountPrice = "Must be less than price.";
            }
        }


        if (isGrandTest && !scheduledFor) {
            newErrors.scheduledFor = "Schedule date is required for a Grand Test.";
        }

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
                subjectError.questions = "Subject must have at least one question count.";
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
        return {
            isValid: Object.keys(newErrors).length === 0,
            totalQuestions: totalQ,
        };
    };

    const handleCreateOrSave = async (e, publish = false) => {
        e.preventDefault();

        const { isValid, totalQuestions } = validateForm();

        if (!isValid) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        const trimmedSubjects = subjects.map((s) => ({
            name: s.name.trim(),
            easy: Number(s.easy) || 0,
            medium: Number(s.medium) || 0,
            hard: Number(s.hard) || 0,
        }));

        // ✅ PATCH 6: Add thumbnail + isFree to PAYLOAD
      const payload = {
    ...form,
    durationMinutes: Number(form.durationMinutes),
    totalMarks: Number(form.totalMarks),
    negativeMarking: Number(form.negativeMarking),
    price: isFree ? 0 : Number(form.price),
    discountPrice: isFree ? 0 : Number(form.discountPrice) || 0,
    thumbnail,
    isFree,
    subjects: trimmedSubjects,
    isPublished: publish,
    isGrandTest,
    totalQuestions,
    ...(isGrandTest && { scheduledFor }),   // ✅ FIXED
};


        try {
            if (isEditMode) {
                // --- UPDATE LOGIC (Handled Internally) ---
                toast.loading("Updating mock test and regenerating questions...");
                console.log("FINAL PAYLOAD BEING SENT:", payload);


                const resultAction = await dispatch(updateMockTest({ ...payload, id }));
                toast.dismiss();

                if (updateMockTest.fulfilled.match(resultAction)) {
                    toast.success("Mock test updated and questions regenerated successfully!");
                    // Navigate back to the main list
                    navigate(`/admin/mocktests/${payload.category}`);
                } else {
                    const errorMsg = resultAction.payload || "Failed to update mock test.";
                    toast.error(errorMsg);
                    setErrors({ form: errorMsg });
                }
            } else {
                // --- CREATE LOGIC (Delegated via Prop) ---
                if (onSubmitHandler) {
                    await onSubmitHandler(payload, publish);
                } else {
                    // This line should technically be unreachable now due to the default prop
                    toast.error("Component setup error: Missing creation handler.");
                }
            }
        } catch (err) {
            toast.dismiss();
            toast.error("An unexpected error occurred.");
            console.error(err);
            setErrors({ form: "An unexpected error occurred." });
        }
    };


    const displayError = errors.form ? (
        <div className="text-red-400 text-center mb-4">{errors.form}</div>
    ) : sliceError ? (
        <div className="text-red-400 text-center mb-4">Error: {sliceError}</div>
    ) : null;

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    if (isEditMode && sliceLoading) {
        return (
            <motion.div
                className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-10 text-white text-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                Loading Test Data...
            </motion.div>
        );
    }

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
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-200 mb-4 transition font-medium"
                >
                    <FaArrowLeft />
                    Back
                </button>

                <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
                    {formTitle || (isEditMode ? "Edit Mock Test" : "Create Mock Test")}
                </h2>

                {displayError}

                <form onSubmit={(e) => handleCreateOrSave(e, false)} className="space-y-6">
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

                    {/* Title & Description */}
                    <Input
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleFormChange}
                        error={errors.title}
                    />

                    <Textarea
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleFormChange}
                        error={errors.description}
                    />

                    {/* ✅ PATCH 3: THUMBNAIL UPLOAD */}
                    {/* === THUMBNAIL UPLOAD === */}
                    <div>
                        <label className="text-sm text-gray-300">Thumbnail</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setThumbnail(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => setThumbnailPreview(reader.result);
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="mt-2 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
                        />

                        {thumbnailPreview && (
                            <img
                                src={thumbnailPreview}
                                alt="preview"
                                className="mt-3 w-32 h-32 object-cover rounded-lg border border-white/20"
                            />
                        )}
                    </div>
                    {/* END OF THUMBNAIL UPLOAD */}

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

                    {/* ✅ PATCH 4: FREE OPTION */}
                    {/* === FREE OPTION === */}
                    <div className="flex items-center gap-3 mb-2">
                        <input
                            type="checkbox"
                            checked={isFree}
                            onChange={(e) => {
                                setIsFree(e.target.checked);
                                if (e.target.checked) {
                                    setForm({ ...form, price: "0", discountPrice: "0" });
                                }
                            }}
                            className="h-5 w-5 text-cyan-400 bg-white/10 border-white/20 rounded"
                        />
                        <span className="text-cyan-400 font-medium">Make this test FREE</span>
                    </div>
                    {/* END OF FREE OPTION */}


                    {/* Price Section */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Price"
                            type="number"
                            name="price"
                            min="0"
                            // ✅ PATCH 5: Disable price field when FREE
                            disabled={isFree}
                            value={form.price}
                            onChange={handleFormChange}
                            error={errors.price}
                        />
                        <Input
                            label="Discount Price"
                            type="number"
                            name="discountPrice"
                            min="0"
                            // ✅ PATCH 5: Disable discount price field when FREE
                            disabled={isFree}
                            value={form.discountPrice}
                            onChange={handleFormChange}
                            error={errors.discountPrice}
                        />
                    </div>

                    {/* GRAND TEST FIELDS */}
                    <div className="pt-4 border-t border-white/20">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-500"
                                    checked={isGrandTest}
                                    onChange={(e) => setIsGrandTest(e.target.checked)}
                                />
                                <span className="text-lg font-medium text-cyan-400">
                                    Is this a Grand Test?
                                </span>
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
                            Subjects & Difficulty Levels (For Auto-Generation)
                        </h3>
                        {errors.subjectsRoot && (
                            <p className="text-red-400 text-sm mb-2">
                                {errors.subjectsRoot}
                            </p>
                        )}

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
                                            onChange={(e) =>
                                                handleSubjectChange(i, "name", e.target.value)
                                            }
                                        />
                                        {errors.subjects?.[i]?.name && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {errors.subjects[i].name}
                                            </p>
                                        )}
                                    </div>
                                    {subjects.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSubject(i)}
                                            className="text-red-400 hover:text-red-300 transition"
                                        >
                                            Remove
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
                                {errors.subjects?.[i]?.questions && (
                                    <p className="text-red-400 text-xs mt-2">
                                        {errors.subjects[i].questions}
                                    </p>
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

                    {/* Action Buttons (Dynamic Text) */}
                    <div className="flex justify-center gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={sliceLoading}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition shadow-lg disabled:opacity-50"
                        >
                            {isEditMode ? "Save Changes" : "Save Draft"}
                        </button>
                        <button
                            type="button"
                            disabled={sliceLoading}
                            onClick={(e) => handleCreateOrSave(e, true)}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-900 font-semibold shadow-xl disabled:opacity-50"
                        >
                            {isEditMode ? "Update & Republish" : "Save & Publish"}
                        </button>
                    </div>
                </form>

                {/* Manage Questions Section (Edit Mode Only) */}
                {isEditMode && (
                    <motion.div
                        className="mt-10 pt-6 border-t border-white/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-cyan-400">
                            Manage Questions (Total: {form.totalQuestions} Generated)
                        </h2>
                        <div className="grid grid-cols-2 gap-5">
                            <button
                                onClick={() =>
                                    navigate(`/admin/mocktests/${id}/questions`)
                                }
                                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/20 hover:border-cyan-400 p-6 rounded-xl cursor-pointer transition"
                            >
                                <span className="text-cyan-400 font-bold text-3xl">👁️</span>
                                <span className="text-white font-medium">Review Generated Questions</span>
                            </button>


                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ------------------------ Small Input Components (Kept as is) ------------------------ */

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
                } text-white placeholder-gray-400 disabled:opacity-50`}
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