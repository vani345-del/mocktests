import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAttempts } from "../../redux/attemptSlice";
import { ChartCard, Th, Td } from "../../components/student/DashboardUIKIt";
import { ClipLoader } from "react-spinners";

const PerformanceHistory = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.attempts);

  useEffect(() => {
    dispatch(fetchMyAttempts());
  }, [dispatch]);

  return (
    <ChartCard title="Attempt History">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <ClipLoader size={40} color="#06b6d4" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Test Name</Th>
                <Th>Date</Th>
                <Th>Score</Th>
                <Th>Percentile</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {list.map((att) => (
                <tr key={att._id} className="hover:bg-gray-50">
                  
                  <Td className="font-semibold text-gray-900">
                    {att.mocktestId?.title || "Untitled Mock Test"}
                  </Td>

                  <Td>{new Date(att.createdAt).toLocaleString()}</Td>

                  <Td>
                    <span className="text-blue-600 font-semibold">
                      {att.score} / {att.mocktestId?.totalMarks}
                    </span>
                  </Td>

                  <Td>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {att.percentile || 0}%
                    </span>
                  </Td>

                  <Td>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Review
                    </button>
                  </Td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ChartCard>
  );
};

export default PerformanceHistory;
