import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const MyTestCard = ({ test }) => {
  const navigate = useNavigate();

const handleStartTest = (mocktestId) => {
    // Simply navigate to the new instructions page
    navigate(`/student/instructions/${mocktestId}`);
  };
  
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">

      {/* 🔵 Top Banner (Featured Style) */}
      <div
        className={`h-32 w-full flex flex-col justify-center items-center text-white text-center shadow-inner
        ${test.type === "Grand" ? "bg-purple-600" : "bg-blue-600"}`}
      >

        {/* Category Name */}
        <p className="text-sm font-semibold opacity-90 tracking-wide uppercase">
          {test.category?.name || test.categorySlug || "Mock Test"}
        </p>

      </div>

      {/* 📝 Content */}
      <div className="p-5 flex flex-col flex-grow">

        {/* Mock Test Name */}
        <h3 className="text-xl font-bold text-gray-900 mt-1 mb-3 line-clamp-2">
          {test.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {test.description || "No description available."}
        </p>

        {/* 🧮 Test Details */}
        <div className="flex justify-between text-sm text-gray-700 mb-4 bg-gray-50 px-3 py-2 rounded-lg shadow-sm">
          <span>
            <strong className="text-blue-600">{test.totalQuestions}</strong>{" "}
            Questions
          </span>
          <span>
            <strong className="text-blue-600">{test.durationMinutes}</strong>{" "}
            Minutes
          </span>
        </div>

        {/* 🚀 Start Test Button */}
        <button
          onClick={() => handleStartTest(test._id)}
          className="mt-auto w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default MyTestCard;
