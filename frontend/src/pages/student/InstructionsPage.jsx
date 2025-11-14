import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyMockTests } from "../../redux/userSlice"; 
import api from "../../api/axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

const InstructionsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mocktestId } = useParams();
  
  // Get all purchased tests from Redux state
  const { myMockTests, myMockTestsStatus } = useSelector((state) => state.user);
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If tests aren't loaded, fetch them
    if (myMockTestsStatus === "idle") {
      dispatch(fetchMyMockTests());
    }
    
    // Once tests are loaded, find the one we need
    if (myMockTestsStatus === "succeeded" && myMockTests.length > 0) {
      const foundTest = myMockTests.find(t => t._id === mocktestId);
      if (foundTest) {
        setTest(foundTest);
      }
    }
  }, [myMockTestsStatus, dispatch, myMockTests, mocktestId]);

  const handleStartTest = async () => {
    setLoading(true);
    const toastId = toast.loading("Starting test...");

    try {
      // Call the backend endpoint that creates the attempt
      const { data } = await api.post(`/api/student/start-test/${mocktestId}`);

      if (!data.attemptId) {
        toast.error("Unable to start test", { id: toastId });
        setLoading(false);
        return;
      }

      toast.success("Test started!", { id: toastId });
      
      // Navigate to the exam page with the new attempt ID
      navigate(`/student/test/${data.attemptId}`, { 
        state: { endsAt: data.endsAt } // Pass the end time to the exam page
      });

    } catch (err) {
      toast.error(err.response?.data?.message || "Error starting test", {
        id: toastId,
      });
      setLoading(false);
    }
  };

  if (myMockTestsStatus === "loading" || !test) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={"#123abc"} />
      </div>
    );
  }

  if (myMockTestsStatus === "succeeded" && !test) {
    // This can happen if the user tries to access a test they haven't purchased
    return <Navigate to="/student-dashboard" replace />;
  }

  return (
    <div className="container mx-auto max-w-3xl p-6 my-10 bg-white shadow-xl rounded-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{test.title}</h1>
      <p className="text-gray-600 mb-6">{test.description}</p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Instructions</h2>
        <ul className="list-disc list-inside space-y-3 text-gray-700">
          <li>This test contains <strong className="text-blue-700">{test.totalQuestions} questions</strong>.</li>
          <li>The duration of the test is <strong className="text-blue-700">{test.durationMinutes} minutes</strong>.</li>
          <li>The timer will start as soon as you click the "Start Exam" button.</li>
          <li>Questions are divided into the following subjects: <strong className="text-blue-700">{test.subjects.map(s => s.name).join(', ')}</strong>.</li>
          <li>Each correct answer will award marks as specified. Incorrect answers may result in negative marking.</li>
          <li>Do not close the browser window or refresh the page during the test.</li>
          <li>Ensure you have a stable internet connection.</li>
          <li>Click "Submit Test" when you are finished. The test will be submitted automatically when the time runs out.</li>
        </ul>
      </div>

      <button
        onClick={handleStartTest}
        disabled={loading}
        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition-all shadow-md flex items-center justify-center"
      >
        {loading ? (
          <ClipLoader size={24} color={"#ffffff"} />
        ) : (
          "Start Exam"
        )}
      </button>
    </div>
  );
};

export default InstructionsPage;