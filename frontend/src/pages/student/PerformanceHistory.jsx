import React from 'react';
import { mockAttempts } from "../../components/student/mockData";
import { ChartCard, Th, Td } from "../../components/student/DashboardUIKIt";

// 3. Performance History Tab
const PerformanceHistory = () => (
  <ChartCard title="Attempt History">
    <div className="overflow-x-auto">
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
          {mockAttempts.map(att => (
            <tr key={att._id} className="hover:bg-gray-50">
              <Td className="font-medium text-gray-900">{att.testName}</Td>
              <Td>{new Date(att.date).toLocaleString()}</Td>
              <Td>
                <span className="font-semibold text-blue-600">
                  {att.score} / {att.totalMarks}
                </span>
              </Td>
              <Td>
                <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  {att.percentile}%
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
    </div>
  </ChartCard>
);

export default PerformanceHistory;