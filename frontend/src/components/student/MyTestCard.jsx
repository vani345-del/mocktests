import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // Use your centralized API instance
import toast from 'react-hot-toast';

// This card component displays one test and handles the "Start Test" logic
const MyTestCard = ({ test }) => {
  const navigate = useNavigate();

  // This logic is borrowed from your StudentMocktests.jsx
  const handleStartTest = async (mocktestId) => {
    const toastId = toast.loading('Starting test...');
    try {
      // 1. Call the backend to create an "attempt"
      const { data } = await api.post(`/api/student/start-test/${mocktestId}`);

      if (!data.attemptId) {
        toast.error("Unable to start test — please try again", { id: toastId });
        return;
      }

      // 2. On success, navigate to the test-taking page
      toast.success("Test started! Good luck.", { id: toastId });
      navigate(`/student/test/${data.attemptId}`);

    } catch (err) {
      toast.error(err.response?.data?.message || "Error starting test", { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-5">
        <span className="text-xs font-semibold text-blue-600 uppercase">
          {test.categorySlug || 'Mock Test'}
        </span>
        <h3 className="text-xl font-bold text-gray-800 mt-1 mb-2">{test.title}</h3>
        <p className="text-gray-600 text-sm mb-4">
          {test.description || 'No description available.'}
        </p>
        <div className="flex justify-between text-sm text-gray-700 mb-4">
          <span>
            <strong>{test.totalQuestions || 0}</strong> Questions
          </span>
          <span>
            <strong>{test.durationMinutes || 0}</strong> Mins
          </span>
        </div>
        <button
          onClick={() => handleStartTest(test._id)}
          className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default MyTestCard;