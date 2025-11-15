import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

// --- (No changes to Timer component) ---
const Timer = ({ expiryTimestamp, onTimeUp }) => {
  const [remaining, setRemaining] = useState(expiryTimestamp - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemaining = expiryTimestamp - Date.now();
      if (newRemaining <= 0) {
        clearInterval(interval);
        setRemaining(0);
        onTimeUp(); // Call submission function
      } else {
        setRemaining(newRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp, onTimeUp]);

  const minutes = Math.floor((remaining / 1000 / 60) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <div className="text-2xl font-bold text-red-600">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

// --- NEW: Submission Result Modal Component ---
// This component will be rendered on top of the page when the test is submitted.
const SubmissionResultModal = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full transform transition-all scale-100 opacity-100">
        <div className="flex flex-col items-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Submitted!</h2>
          <p className="text-gray-600 mb-6">Thank you for completing the test.</p>

          {/* Overall Score */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full text-center mb-6">
            <h3 className="text-sm font-semibold text-blue-800 uppercase mb-1">Your Score</h3>
            <p className="text-4xl font-bold text-blue-900">
              {result.score} <span className="text-2xl text-gray-500">/ {result.total}</span>
            </p>
          </div>

          {/* Subject-wise Scores */}
          {/* This section will only appear if your API returns the 'subjectWiseScores' array */}
          {result.subjectWiseScores && result.subjectWiseScores.length > 0 && (
            <div className="w-full mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Subject Breakdown:</h4>
              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {result.subjectWiseScores.map((sub, index) => (
                  <li key={index} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-md">
                    <span className="font-medium text-gray-700">{sub.subject}</span>
                    <span className="font-bold text-gray-900">{sub.score} / {sub.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Main Exam Component (Modified) ---
const WriteMocktest = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW: State for modal ---
  const [showResultModal, setShowResultModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Fetch the attempt details (which includes the questions)
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
         const { data } = await api.get(`/api/student/attempt/${attemptId}`); 
         setAttempt(data);
         if (data.answers) {
           const saved = {};
           data.answers.forEach(a => {
             saved[a.questionId] = a.selectedAnswer;
           });
           setAnswers(saved);
         }
      } catch (err) {
        toast.error('Could not load test. ' + err.response?.data?.message);
        navigate('/student-dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId, navigate]);
  
  // --- (No changes to memoized subjects and questions) ---
  const subjects = useMemo(() => {
    if (!attempt) return [];
    const allSubjects = attempt.questions.map(q => q.category); 
    return ['all', ...new Set(allSubjects)];
  }, [attempt]);

  const filteredQuestions = useMemo(() => {
    if (!attempt) return [];
    if (selectedSubject === 'all') {
      return attempt.questions;
    }
    return attempt.questions.filter(q => q.category === selectedSubject);
  }, [attempt, selectedSubject]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  // --- (No changes to handleSelectOption) ---
  const handleSelectOption = (questionId, optionText) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionText
    }));
  };

  // --- MODIFIED: handleSubmit ---
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    const confirm = window.confirm("Are you sure you want to submit?");
    if (!confirm) {
      return; // User cancelled
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting your test...");
    
    const payload = {
      answers: Object.keys(answers).map(qId => ({
        questionId: qId,
        selectedAnswer: answers[qId]
      }))
    };

    try {
      const { data } = await api.post(`/api/student/submit-test/${attemptId}`, payload);
      
      // --- NEW LOGIC ---
      toast.dismiss(toastId); // Close the loading toast
      
      // *** IMPORTANT ***
      // For subject-wise scores, your API must return a 'subjectWiseScores' array in the response.
      // Example `data` object: { score: 80, total: 100, subjectWiseScores: [...] }
      setSubmissionResult(data); 
      setShowResultModal(true); // Show the success modal
      
      // We no longer navigate from here or show the simple toast.
      // navigate(`/student/results/${attemptId}`);
      // toast.success(`Test Submitted! Your Score: ${data.score}/${data.total}`, { id: toastId, duration: 5000 });

    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed", { id: toastId });
      setIsSubmitting(false); // Only set submitting to false on failure
    }
  };
  
  // --- MODIFIED: handleTimeUp ---
  const handleTimeUp = () => {
    // This function will now also trigger the modal via handleSubmit
    toast.error("Time's up! Submitting your test automatically.", { duration: 3000 });
    handleSubmit();
  };

  // --- (No changes to loading spinner) ---
  if (loading || !attempt) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={"#123abc"} />
      </div>
    );
  }
  
  const endsAt = attempt.endsAt;

  return (
    // --- NEW: Added React.Fragment to wrap modal and main content ---
    <>
      <div className="flex h-[calc(100vh-80px)] mt-10">
        {/* Subject Sidebar */}
        <div className="w-1/5 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Subjects</h2>
          <ul className="space-y-2">
            {subjects.map(subject => (
              <li key={subject}>
                <button
                  onClick={() => {
                    setSelectedSubject(subject);
                    setCurrentQuestionIndex(0); 
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    selectedSubject === subject
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="w-4/5 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm">
            <h1 className="text-xl font-bold text-gray-800">{attempt.mocktestId.title || 'Mock Test'}</h1>
            <div className="flex items-center space-x-4">
              <Timer expiryTimestamp={new Date(endsAt).getTime()} onTimeUp={handleTimeUp} />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>

          {/* Question Area */}
          <div className="flex-grow p-8 overflow-y-auto bg-gray-100">
            {!currentQuestion ? (
              <div className="text-center text-gray-600">
                <p>No questions found for this subject.</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                  </h3>
                  <span className="text-sm text-gray-600">
                    Marks: {currentQuestion.marks} | Negative: {currentQuestion.negative}
                  </span>
                </div>
                
                <p className="text-gray-800 text-base mb-6" style={{ whiteSpace: 'pre-wrap' }}>
                  {currentQuestion.title}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion._id] === option;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectOption(currentQuestion._id, option)}
                        className={`block w-full text-left p-4 rounded-lg border-2 transition-all
                          ${
                            isSelected
                              ? 'bg-blue-100 border-blue-500 shadow'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className={`font-mono mr-3 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className={`${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-between p-4 bg-white border-t border-gray-200">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === filteredQuestions.length - 1}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- NEW: Conditional rendering of the result modal --- */}
      {showResultModal && submissionResult && (
        <SubmissionResultModal
          result={submissionResult}
          onClose={() => {
            setShowResultModal(false);
            // As requested, navigate to the student dashboard.
            navigate('/student-dashboard'); 
          }}
        />
      )}
    </>
  );
};

export default WriteMocktest;