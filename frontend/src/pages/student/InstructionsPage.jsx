import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyMockTests } from "../../redux/userSlice"; 
import api from "../../api/axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { 
  Clock, 
  HelpCircle, 
  FileText, 
  Zap, 
  CheckSquare,
  Tag, // <--- ADDED: Tag icon import
  Play, // <--- ADDED: Play icon import (used in Start button)
  BarChart2 // <--- ADDED: BarChart2 icon import (used in Marking Scheme header)
} from 'lucide-react';

const InstructionsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mocktestId } = useParams();
  
  // Get all purchased tests from Redux state
  const { myMockTests, myMockTestsStatus } = useSelector((state) => state.user);
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Data Fetching and Validation Logic ---
  useEffect(() => {
    // If tests aren't loaded, fetch them
    if (myMockTestsStatus === "idle") {
      dispatch(fetchMyMockTests());
    }
    
    // Once tests are loaded, find the one we need
    if (myMockTestsStatus === "succeeded" && myMockTests.length > 0) {
      // Assuming test data structure includes 'subjects' and 'totalQuestions'
      const foundTest = myMockTests.find(t => t._id === mocktestId);
      if (foundTest) {
        setTest(foundTest);
      }
    }
  }, [myMockTestsStatus, dispatch, myMockTests, mocktestId]);

  // --- Start Test Handler ---
  const handleStartTest = async () => {
    if (loading) return;

    setLoading(true);
    const toastId = toast.loading("Starting exam attempt...");

    try {
      // Call the backend endpoint that creates the attempt
      const { data } = await api.post(`/api/student/start-test/${mocktestId}`);

      if (!data.attemptId) {
        toast.error("Failed to start test. Missing attempt ID.", { id: toastId });
        setLoading(false);
        return;
      }

      toast.success("Exam has begun! Good luck!", { id: toastId });
      
      // Navigate to the exam page with the new attempt ID
      navigate(`/student/test/${data.attemptId}`, { 
        state: { endsAt: data.endsAt } // Pass the end time to the exam page
      });

    } catch (err) {
      toast.error(err.response?.data?.message || "Error starting test. Please try again.", {
        id: toastId,
      });
      setLoading(false);
    }
  };

  // --- Loading State ---
  if (myMockTestsStatus === "loading" || !test) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-gray-50">
        <ClipLoader size={50} color={"#06b6d4"} />
      </div>
    );
  }

  // --- Unauthorized Access State ---
  if (myMockTestsStatus === "succeeded" && !test) {
    // Redirects to dashboard if test is not found (i.e., not purchased or invalid ID)
    return <Navigate to="/student-dashboard" replace />;
  }

  // --- Component Rendering ---
  // Using destructuring for easier access to test properties
  const { 
    title, 
    description, 
    totalQuestions, 
    durationMinutes, 
    subjects,
    totalMarks 
  } = test;
  
  // Example data for marking scheme (replace with real data structure later)
  const markingScheme = {
      correct: "+4",
      incorrect: "-1",
      unanswered: "0",
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="w-full max-w-4xl">
        
        {/* Test Header */}
        <header className="text-center mb-10 bg-white p-6 rounded-xl shadow-lg border-t-4 border-cyan-500">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600 italic">
            Instructions for the Mock Examination
          </p>
        </header>

        {/* Test Summary Cards (Responsive Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 border-l-4 border-cyan-500">
            <FileText className="h-8 w-8 text-cyan-600"/>
            <div>
              <p className="text-sm text-gray-500">Total Questions</p>
              <p className="text-xl font-bold text-gray-900">{totalQuestions || 'N/A'}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 border-l-4 border-cyan-500">
            <Clock className="h-8 w-8 text-cyan-600"/>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-xl font-bold text-gray-900">{durationMinutes ? `${durationMinutes} Minutes` : 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 border-l-4 border-cyan-500">
            <CheckSquare className="h-8 w-8 text-cyan-600"/>
            <div>
              <p className="text-sm text-gray-500">Maximum Marks</p>
              <p className="text-xl font-bold text-gray-900">{totalMarks || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Test Description */}
        <section className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <HelpCircle className="h-6 w-6 mr-3 text-red-500"/>
                General Instructions
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {description || "Please read all instructions carefully before starting your exam. Familiarize yourself with the layout and question types."}
            </p>
        </section>

        {/* Detailed Rules & Guidelines */}
        <section className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-cyan-600"/>
                Examination Guidelines
            </h2>
            <ul className="space-y-4 text-gray-700">
              
              {/* Timing */}
              <li className="flex items-start">
                <Clock className="h-5 w-5 mt-1 mr-3 text-yellow-600 flex-shrink-0"/>
                <div>
                  <strong className="font-semibold text-gray-900">Time Limit:</strong> The exam is strictly timed at <strong className="text-cyan-700">{durationMinutes} minutes</strong>. The timer starts immediately upon clicking "Start Exam".
                </div>
              </li>
              
              {/* Question Count */}
              <li className="flex items-start">
                <CheckSquare className="h-5 w-5 mt-1 mr-3 text-green-600 flex-shrink-0"/>
                <div>
                  <strong className="font-semibold text-gray-900">Total Questions:</strong> There are <strong className="text-cyan-700">{totalQuestions} questions</strong> to be attempted.
                </div>
              </li>

              {/* Subjects */}
              {subjects && subjects.length > 0 && (
                <li className="flex items-start">
                  <Tag className="h-5 w-5 mt-1 mr-3 text-purple-600 flex-shrink-0"/>
                  <div>
                    <strong className="font-semibold text-gray-900">Sections:</strong> Questions are categorized into subjects: <strong className="text-cyan-700">{subjects.map(s => s.name).join(', ')}</strong>.
                  </div>
                </li>
              )}
              
              {/* Technical Rule */}
              <li className="flex items-start">
                <Zap className="h-5 w-5 mt-1 mr-3 text-red-600 flex-shrink-0"/>
                <div>
                  <strong className="font-semibold text-gray-900">Technical Note:</strong> Do not close the browser tab or press the refresh button. Doing so may submit your current attempt. Ensure a stable internet connection.
                </div>
              </li>
              
              {/* Submission Rule */}
              <li className="flex items-start">
                <CheckSquare className="h-5 w-5 mt-1 mr-3 text-blue-600 flex-shrink-0"/>
                <div>
                  <strong className="font-semibold text-gray-900">Submission:</strong> The test will be submitted automatically when the timer reaches zero, or when you click the final "Submit Test" button.
                </div>
              </li>
            </ul>
        </section>

        {/* Marking Scheme */}
        <section className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChart2 className="h-6 w-6 mr-3 text-cyan-600"/>
                Marking Scheme
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center border border-gray-200 rounded-lg divide-x divide-gray-200">
                <div className="p-4 bg-green-50">
                    <p className="text-sm font-medium text-green-700 mb-1">Correct Answer</p>
                    <p className="text-xl font-extrabold text-green-800">{markingScheme.correct} Marks</p>
                </div>
                <div className="p-4 bg-red-50">
                    <p className="text-sm font-medium text-red-700 mb-1">Incorrect Answer</p>
                    <p className="text-xl font-extrabold text-red-800">{markingScheme.incorrect} Marks</p>
                </div>
                <div className="p-4 bg-yellow-50">
                    <p className="text-sm font-medium text-yellow-700 mb-1">Unanswered</p>
                    <p className="text-xl font-extrabold text-yellow-800">{markingScheme.unanswered} Marks</p>
                </div>
            </div>
        </section>

        {/* Start Button */}
        <div className="mb-10">
          <button
            onClick={handleStartTest}
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-xl hover:bg-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ClipLoader size={24} color={"#ffffff"} className="mr-3" />
                Initiating Exam...
              </>
            ) : (
              <>
                <Play className="h-6 w-6 mr-3" />
                I have read the instructions, Start Exam
              </>
            )}
          </button>
          <p className="text-center text-sm text-gray-500 mt-3">
            By clicking "Start Exam", you acknowledge and agree to abide by all the rules and regulations.
          </p>
        </div>

      </div>
    </div>
  );
};

export default InstructionsPage;