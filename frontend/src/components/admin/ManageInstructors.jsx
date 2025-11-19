import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInstructors,
  toggleInstructorStatus,
} from "../../redux/instructorSlice";
import { FaBan, FaCheckCircle } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const ManageInstructors = () => {
  const dispatch = useDispatch();
  const { instructors, status, error } = useSelector((state) => state.instructors);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Fetch data
  useEffect(() => {
    dispatch(fetchInstructors());
  }, [dispatch]);

  const handleToggle = (id) => {
    dispatch(toggleInstructorStatus(id));
  };

  // 🔍 Filter Logic
  const filteredInstructors = useMemo(() => {
    let filtered = instructors;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = instructors.filter(
        (inst) =>
          inst.name.toLowerCase().includes(term) ||
          inst.email.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [searchTerm, instructors]);

  // 🔢 Pagination Logic
  const totalPages = Math.ceil(filteredInstructors.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInstructors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredInstructors]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          👨‍🏫 Manage Instructors
        </h1>

        {/* Search Box */}
        <div className="relative w-64">
          <FiSearch className="absolute top-3 left-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search instructor..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <p className="text-gray-500 text-center py-8">Loading instructors...</p>
      )}

      {/* Error */}
      {status === "failed" && (
        <p className="text-red-500 text-center py-8">{error}</p>
      )}

      {/* Empty */}
      {status === "succeeded" && filteredInstructors.length === 0 && (
        <p className="text-gray-500 text-center py-8">No instructors found.</p>
      )}

      {/* Table */}
      {status === "succeeded" && filteredInstructors.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700 uppercase text-sm">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((inst) => (
                  <tr key={inst._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {inst.name}
                    </td>

                    <td className="py-3 px-4 text-gray-600">{inst.email}</td>

                    <td className="py-3 px-4 text-gray-600 capitalize">
                      {inst.role}
                    </td>

                    <td className="py-3 px-4">
                      {inst.isBlocked ? (
                        <span className="text-red-600 font-semibold flex items-center gap-2">
                          <FaBan /> Blocked
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold flex items-center gap-2">
                          <FaCheckCircle /> Active
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(inst._id)}
                        className={`px-4 py-2 rounded-md text-white transition ${
                          inst.isBlocked
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {inst.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageInstructors;
