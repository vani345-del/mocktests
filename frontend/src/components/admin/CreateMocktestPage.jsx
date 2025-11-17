import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormMocktest from "./FormMocktest"; // Your existing form component
import { FaArrowLeft } from "react-icons/fa";

// This is the new page component that wraps your form
export default function CreateMocktestPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  // "onClose" now means "go back"
  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  // "onSuccess" now means "go back to the category page"
  const handleSuccess = () => {
    // Navigate back to the category list. That page will
    // automatically refresh the list because of its useEffect.
    navigate(`/admin/categories/${category}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-6 py-10">
      {/* Back button */}
      <button
        onClick={handleClose}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
      >
        <FaArrowLeft />
        Back to {category} Mocktests
      </button>

      {/* Page Header */}
      <h1 className="text-4xl font-bold text-gray-800 capitalize tracking-tight mb-10">
        Create New Mocktest in{" "}
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          {category}
        </span>
      </h1>

      {/* Here is your existing FormMocktest component.
        We changed no code inside it. We just placed it on this new page
        and gave it new functions for onClose and onSuccess.
      */}
      <FormMocktest
        category={category}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}