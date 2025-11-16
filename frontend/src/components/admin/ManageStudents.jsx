import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents } from "../../redux/studentSlice";
import {
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

const ManageStudents = () => {
  const dispatch = useDispatch();
  const { students, status, error } = useSelector((state) => state.students);

  useEffect(() => {
    // Fetch students only if the state is 'idle' (first load)
    if (status === "idle") {
      dispatch(fetchStudents());
    }
  }, [status, dispatch]);

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
              
             
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{student.email}</div>
                  </td>
                
                  
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No students found.
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
    <div className="p-6">
      <Link
        to="/admin"
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition font-medium"
      >
        <FaArrowLeft />
        Back to Dashboard
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Students</h1>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {content}
      </div>
    </div>
  );
};

export default ManageStudents;