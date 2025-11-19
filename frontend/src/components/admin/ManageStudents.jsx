import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents, blockStudent, deleteStudent } from "../../redux/studentSlice";

import {
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

const ManageStudents = () => {
  const dispatch = useDispatch();
  const { students, status, error } = useSelector((state) => state.students);

  useEffect(() => {
    if (status === "idle") dispatch(fetchStudents());
  }, [status, dispatch]);

  // ACTION HANDLERS
  const handleBlock = (id, currentStatus) => {
    dispatch(blockStudent({ id, status: !currentStatus }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      dispatch(deleteStudent(id));
    }
  };

  let content;

  if (status === "loading") {
    content = (
      <div className="flex justify-center items-center p-10">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  else if (status === "failed") {
    content = (
      <div className="flex flex-col items-center justify-center p-10 text-red-600">
        <FaExclamationTriangle className="text-4xl mb-2" />
        <p>Error: {error}</p>
      </div>
    );
  }

  else if (status === "succeeded") {
    content = (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Student</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-sm">
            {students.length > 0 ? (
              students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition">
                  
                  {/* NAME */}
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {s.firstName} {s.lastName}
                  </td>

                  {/* EMAIL */}
                  <td className="px-6 py-4 text-gray-700">{s.email}</td>

                  {/* PHONE */}
                  <td className="px-6 py-4 text-gray-700">{s.phone || "—"}</td>

                  {/* ROLE */}
                  <td className="px-6 py-4 capitalize text-gray-700">
                    {s.role}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    {s.isBlocked ? (
                      <span className="text-red-600 flex items-center gap-1 font-medium">
                        <FaBan /> Blocked
                      </span>
                    ) : (
                      <span className="text-green-600 flex items-center gap-1 font-medium">
                        <FaCheckCircle /> Active
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">

                      {/* BLOCK / UNBLOCK */}
                      <button
                        onClick={() => handleBlock(s._id, s.isBlocked)}
                        className={`px-3 py-1 rounded-lg text-white text-xs font-semibold transition ${
                          s.isBlocked
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {s.isBlocked ? "Unblock" : "Block"}
                      </button>

                      {/* EDIT */}
                      <Link
                        to={`/admin/users/students/edit/${s._id}`}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-white text-xs font-semibold transition flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </Link>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="bg-gray-700 hover:bg-black px-3 py-1 rounded-lg text-white text-xs font-semibold transition flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-6">
      
      {/* BACK BUTTON */}
      <Link
        to="/admin"
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
      >
        <FaArrowLeft /> Back to Dashboard
      </Link>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎓 Manage Students</h1>

        <Link
          to="/admin/users/students/add"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          + Add Student
        </Link>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white shadow-xl rounded-xl border overflow-hidden">
        {content}
      </div>

    </div>
  );
};

export default ManageStudents;
