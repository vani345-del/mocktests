import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const ManageStudents = () => {
  return (
    <div className="p-6">
      <Link
        to="/admin"
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
      >
        <FaArrowLeft />
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-semibold">Manage Students</h1>
    </div>
  );
};

export default ManageStudents;