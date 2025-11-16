import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInstructors,
  addInstructor,
  toggleInstructorStatus, // 👈 Import our new action
} from "../../redux/instructorSlice";
import { FaArrowLeft, FaPlus, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { ClipLoader } from "react-spinners"; // A simple loader

// --- AddInstructorModal Component (Helper for the page) ---
const AddInstructorModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // onAdd is the handleAddInstructor function from the main component
    await onAdd({ name, email, password }); 
    setLoading(false);
    onClose(); // Close modal on success
    // Clear form
    setName("");
    setEmail("");
    setPassword("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Instructor</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : "Add Instructor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ManageInstructors Component (Main Page) ---
const ManageInstructors = () => {
  const dispatch = useDispatch();
  const { instructors, status, error } = useSelector((state) => state.instructors);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch instructors if the state is 'idle' (first load)
    if (status === "idle") {
      dispatch(fetchInstructors());
    }
  }, [status, dispatch]);

  const handleAddInstructor = async (instructorData) => {
    // Dispatch the addInstructor action
    await dispatch(addInstructor(instructorData));
  };

  const handleToggleStatus = (id) => {
    // Dispatch our new toggle status action
    dispatch(toggleInstructorStatus(id));
  };

  let content;

  if (status === "loading") {
    content = (
      <div className="flex justify-center items-center p-10">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  } else if (status === "succeeded") {
    content = (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {instructors.length > 0 ? (
              instructors.map((instructor) => (
                <tr key={instructor._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{instructor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Display status based on the isActive field */}
                    {instructor.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* Button to toggle status */}
                    <button
                      onClick={() => handleToggleStatus(instructor._id)}
                      className={`px-3 py-1 rounded-md text-white transition-colors ${
                        instructor.isActive
                          ? "bg-red-500 hover:bg-red-600" // If active, show "Block"
                          : "bg-green-500 hover:bg-green-600" // If blocked, show "Unblock"
                      }`}
                    >
                      {instructor.isActive ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No instructors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  } else if (status === "failed") {
    content = (
      <div className="flex flex-col items-center justify-center p-10 text-red-600">
        <FaExclamationTriangle className="text-4xl mb-2" />
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <Link
          to="/admin"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Manage Instructors</h1>
          {/* Button to open the modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition"
          >
            <FaPlus />
            Add Instructor
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {content}
        </div>
      </div>
      {/* The Modal component itself */}
      <AddInstructorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddInstructor}
      />
    </>
  );
};

export default ManageInstructors;