import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Clock,
    BarChart2,
    Play
} from 'lucide-react';
import api from "../../api/axios";

// Reusable Stat Item
const StatItem = ({ icon: Icon, value, label, accentColorClass }) => (
    <div className="text-center">
        <Icon size={20} className={`${accentColorClass} mx-auto mb-1`} />
        <p className="text-lg sm:text-xl font-extrabold text-white leading-tight">{value}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

const MyTestCard = ({ test }) => {
    const navigate = useNavigate();

    const [imageURL, setImageURL] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);

    /* ======================================================
       📌 FIXED — ALWAYS LOAD IMAGE USING API WITH BLOB
    ====================================================== */
    useEffect(() => {
        if (!test.thumbnail) {
            setImageURL("https://placehold.co/600x400?text=No+Image");
            return;
        }

        const fetchImage = async () => {
            try {
                setLoadingImage(true);

                // If backend returns "/uploads/..", use full baseURL automatically
                const imgPath = test.thumbnail.startsWith("/")
                    ? test.thumbnail
                    : `/${test.thumbnail}`;

                const response = await api.get(imgPath, { responseType: "blob" });
                const blobURL = URL.createObjectURL(response.data);

                setImageURL(blobURL);
            } catch (error) {
                console.error("❌ Failed to load student test thumbnail:", error);
                setImageURL("https://placehold.co/600x400?text=Image+Error");
            } finally {
                setLoadingImage(false);
            }
        };

        fetchImage();

        return () => {
            if (imageURL) URL.revokeObjectURL(imageURL);
        };
    }, [test.thumbnail]);

    const imgSrc = imageURL || "https://placehold.co/600x400?text=Loading...";

    /* ======================================================
       📌 TEST PROGRESS & UI LOGIC
    ====================================================== */
    const isCompleted = test.status === "completed";
    const progress = isCompleted ? 100 : test.progress || 0;

    const accent = isCompleted
        ? { bg: "from-green-500 to-emerald-400", text: "text-green-400" }
        : progress > 0
            ? { bg: "from-orange-500 to-amber-400", text: "text-orange-400" }
            : { bg: "from-cyan-500 to-teal-400", text: "text-cyan-400" };

    const handleStart = () => {
        if (isCompleted) {
            navigate(`/student/report/${test._id}`);
        } else {
            navigate(`/student/instructions/${test._id}`);
        }
    };

    return (
        <div
            className="
                group flex flex-col bg-gray-900 rounded-2xl shadow-xl border border-gray-800
                transition duration-300 w-full 
                hover:scale-[1.03] hover:shadow-2xl hover:shadow-cyan-500/30
            "
        >

            {/* Thumbnail */}
            <div className="relative w-full h-44 sm:h-52 rounded-t-2xl overflow-hidden">
                {loadingImage ? (
                    <div className="flex items-center justify-center w-full h-full bg-gray-800 animate-pulse text-gray-500">
                        Loading...
                    </div>
                ) : (
                    <img
                        src={imgSrc}
                        alt={test.title}
                        className="w-full h-full object-cover"
                    />
                )}

                <span
                    className={`
                        absolute bottom-0 right-0 px-4 py-2 text-lg sm:text-xl font-extrabold text-white 
                        bg-gradient-to-r ${accent.bg} rounded-tl-xl shadow-inner
                    `}
                >
                    {isCompleted ? "COMPLETED" : progress > 0 ? "IN PROGRESS" : "READY"}
                </span>

                <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow">
                    MY TEST
                </span>
            </div>

            {/* Content */}
            <div className="p-5 pb-3 flex-grow">
                <p className="text-xs text-gray-400 uppercase mb-1">
                    {test.category?.name || "Category"}
                </p>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug line-clamp-2 group-hover:text-cyan-300 transition">
                    {test.title}
                </h3>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-x-2 py-4 mt-4 border-t border-b border-gray-700/40">
                    <StatItem icon={Clock} value={test.durationMinutes} label="Min" accentColorClass={accent.text} />
                    <StatItem icon={BookOpen} value={test.totalQuestions} label="Questions" accentColorClass={accent.text} />
                    <StatItem icon={BarChart2} value={test.attemptsMade || 0} label="Attempts" accentColorClass={accent.text} />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-5">
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-cyan-500"}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Button */}
            <div className="p-5 pt-4">
                <button
                    onClick={handleStart}
                    className={`
                        w-full flex items-center justify-center py-3 rounded-xl 
                        font-bold text-white transition
                        ${isCompleted ? "bg-green-600 hover:bg-green-500" : "bg-cyan-600 hover:bg-cyan-500"}
                    `}
                >
                    <Play size={18} className="mr-2" />
                    {isCompleted ? "View Report" : progress > 0 ? "Resume Exam" : "Start Exam"}
                </button>
            </div>
        </div>
    );
};

export default MyTestCard;
