import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios'
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

// Timer component
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

// Main Exam Component
const WriteMocktest = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To get the 'endsAt' from state

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // Stores answers in format: { "questionId": "selectedAnswerText" }
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the attempt details (which includes the questions)
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        
         const { data } = await api.get(`/api/student/attempt/${attemptId}`); 
         setAttempt(data);
         // Restore saved answers if any (for resuming)
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
  
  // Memoize subjects and filtered questions
  const subjects = useMemo(() => {
    if (!attempt) return [];
    const allSubjects = attempt.questions.map(q => q.category); // 'category' holds the subject name
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

  const handleSelectOption = (questionId, optionText) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionText
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const confirm = window.confirm("Are you sure you want to submit?");
    if (!confirm) {
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading("Submitting your test...");
    
    // Format answers for the backend
    const payload = {
      answers: Object.keys(answers).map(qId => ({
        questionId: qId,
        selectedAnswer: answers[qId]
      }))
    };

    try {
      const { data } = await api.post(`/api/student/submit-test/${attemptId}`, payload);
      toast.success(`Test Submitted! Your Score: ${data.score}/${data.total}`, { id: toastId, duration: 5000 });
      
      // Navigate to a results page (you'll need to create this)
      navigate(`/student/results/${attemptId}`);

    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed", { id: toastId });
      setIsSubmitting(false);
    }
  };
  
  // Auto-submit when timer hits zero
  const handleTimeUp = () => {
    toast.error("Time's up! Submitting your test automatically.", { duration: 3000 });
    handleSubmit();
  };

  if (loading || !attempt) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} color={"#123abc"} />
      </div>
    );
  }
  
  const endsAt = attempt.endsAt; // Get expiry time

  return (
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
                  setCurrentQuestionIndex(0); // Reset index on subject change
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
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
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
  );
};

export default WriteMocktest;