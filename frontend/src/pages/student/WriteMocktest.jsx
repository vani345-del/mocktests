import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Clock, Menu, X, Check, Eye, ChevronLeft, ChevronRight, Send, BarChart2, Tag, Play } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

/* --------------------------------------
    TIMER COMPONENT
-------------------------------------- */
const Timer = ({ expiryTimestamp, onTimeUp }) => {
  const [remaining, setRemaining] = useState(expiryTimestamp - Date.now());

  const timerColor = remaining < 60000 * 5 // Less than 5 minutes
    ? "text-red-500" 
    : (remaining < 60000 * 15 ? "text-yellow-500" : "text-green-600");

  useEffect(() => {
    const interval = setInterval(() => {
      const r = expiryTimestamp - Date.now();
      if (r <= 1000) { // Give a small buffer
        clearInterval(interval);
        setRemaining(0);
        onTimeUp();
      } else {
        setRemaining(r);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp, onTimeUp]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className={`flex items-center text-xl font-extrabold ${timerColor} p-2 rounded-lg bg-white border`}>
      <Clock className="h-5 w-5 mr-2" />
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
};

/* --------------------------------------
    QUESTION RENDERER (Sub-Component)
-------------------------------------- */
const QuestionRenderer = ({ question, answers, handleAnswer }) => {
  if (!question) return null; // Safety check

  // If it's a passage type question, render the passage content, not the interaction.
  if (question.questionType === "passage") {
    return (
      <div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded-xl shadow-inner mb-6">
        <h3 className="text-xl font-bold text-purple-900 mb-4">Reading Passage</h3>
        
        {question.questionText && (
          <p className="whitespace-pre-line mb-4 text-gray-700">
            {question.questionText}
          </p>
        )}

        {question.questionImageUrl && (
          <img
            src={`${BASE_URL}/${question.questionImageUrl}`}
            className="max-h-80 w-full object-contain rounded-lg border my-4"
            alt="Passage Illustration"
          />
        )}

        <p className="text-sm italic mt-4 text-purple-700 font-semibold">
          (Note: Questions based on this passage follow next.)
        </p>
      </div>
    );
  }

  // If it's a child question, render the parent passage for context
  const hasParentPassage = question.parentPassage;
  const parentPassage = question.parentPassage;

  return (
    <div className="space-y-6">
      {/* Passage Context Block */}
      {hasParentPassage && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-xl mb-4 text-sm shadow-inner">
          <h4 className="font-semibold mb-2 text-blue-800">Passage Reference:</h4>
          <p className="text-gray-700 line-clamp-4 overflow-hidden">
            {parentPassage.text || "Passage content is displayed here for context..."}
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); /* Logic to open full passage modal */ }} className="text-blue-600 hover:underline text-xs mt-1 block">
            Read Full Passage
          </a>
        </div>
      )}

      {/* Question Content */}
      <h3 className="text-xl font-bold text-gray-800">
        Question: {question.questionText}
      </h3>

      {question.questionImageUrl && (
        <img
          src={`${BASE_URL}/${question.questionImageUrl}`}
          className="max-h-80 w-full object-contain rounded-lg border shadow-sm"
          alt="Question Illustration"
        />
      )}

      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <p className="text-sm font-semibold mb-3 text-gray-600">Choose your answer:</p>
        
        {/* Answer Options: MCQ */}
        {question.questionType === "mcq" && (
          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const chosen = answers[question._id]?.selected?.[0] === idx;
              const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(question._id, "mcq", idx)}
                  className={`w-full text-left p-4 rounded-lg flex items-center space-x-4 transition-all duration-150 border-2 
                    ${chosen
                      ? "bg-cyan-100 border-cyan-500 shadow-md"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0 ${chosen ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {optionLabel}
                  </span>
                  <span className="text-base text-gray-800 flex-grow">{opt.text || `Option ${optionLabel}`}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Answer Options: Manual/Text */}
        {question.questionType === "manual" && (
          <textarea
            rows="6"
            className="w-full border-2 border-gray-300 p-4 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none text-gray-700 shadow-inner"
            placeholder="Write your detailed answer here..."
            value={answers[question._id]?.manual || ""}
            onChange={(e) =>
              handleAnswer(question._id, "manual", e.target.value)
            }
          />
        )}
      </div>
      
      {/* Question Metadata */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-600 pt-3 border-t border-gray-100">
          <span>Marks: **{question.marks || 'N/A'}**</span>
          <span>Negative: **{question.negativeMarks || 'None'}**</span>
      </div>
    </div>
  );
};

/* --------------------------------------
    QUESTION NAVIGATION PANEL
-------------------------------------- */
const QuestionNavigationPanel = ({ questions, currentIndex, setCurrentIndex, answers, isMobile, onClose }) => {
  // Helper to determine question status
  const getQuestionStatus = (qid) => {
    const answer = answers[qid];
    if (answer?.selected?.length || (answer?.manual && answer.manual.trim().length > 0)) {
      return 'answered';
    }
    // Add logic for 'marked for review' if implemented
    // if (answer?.markedForReview) { return 'marked'; }
    return 'unanswered';
  };

  const statusMap = {
    answered: 'bg-green-500 text-white',
    unanswered: 'bg-red-500 text-white',
    marked: 'bg-yellow-500 text-gray-900',
    current: 'bg-cyan-600 text-white ring-4 ring-cyan-200',
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };

  const handleNavClick = (index) => {
    setCurrentIndex(index);
    if (isMobile) {
      onClose();
    }
  };

  // Filter out passages for the navigation panel (only show actionable questions)
  const actionableQuestions = questions.filter(q => q.questionType !== 'passage');

  return (
    <div className={`flex flex-col p-4 h-full overflow-y-auto ${isMobile ? 'bg-white' : 'bg-gray-50'}`}>
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex justify-between items-center">
        Question Palette
        {isMobile && (
          <button onClick={onClose} className="text-gray-500 p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        )}
      </h3>
      
      {/* Summary Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs font-medium mb-4 p-3 bg-white rounded-lg shadow-sm">
        <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-green-500 mr-2 flex-shrink-0"></span>
            Answered ({actionableQuestions.filter(q => getQuestionStatus(q._id) === 'answered').length})
        </div>
        <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-red-500 mr-2 flex-shrink-0"></span>
            Unanswered ({actionableQuestions.filter(q => getQuestionStatus(q._id) === 'unanswered').length})
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-3 flex-grow">
        {actionableQuestions.map((q, index) => {
          const status = getQuestionStatus(q._id);
          let colorClass = statusMap.default;

          if (index === currentIndex) {
            colorClass = statusMap.current;
          } else if (status === 'answered') {
            colorClass = statusMap.answered;
          } else if (status === 'unanswered') {
            colorClass = statusMap.unanswered;
          }

          return (
            <button
              key={q._id}
              onClick={() => handleNavClick(index)}
              title={`Question ${index + 1}`}
              className={`h-10 w-10 flex items-center justify-center font-bold rounded-lg transition-colors duration-150 shadow-md ${colorClass}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};


/* --------------------------------------
    MAIN COMPONENT: WriteMocktest
-------------------------------------- */
const WriteMocktest = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false); 

  // Use useCallback for functions passed as props to avoid re-renders
  const handleAnswer = useCallback((qid, type, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: {
        selected: type === "mcq" ? [value] : prev[qid]?.selected || [],
        manual: type === "manual" ? value : prev[qid]?.manual || "",
      },
    }));
  }, []);
  
  /* --------------------------------------
    MEMOIZED DATA & FILTERS
    Define these early as many things depend on them.
  -------------------------------------- */
  const subjects = useMemo(() => {
    if (!attempt) return [];
    const subjectsSet = new Set(attempt.questions.map((q) => q.subject).filter(Boolean));
    return ["all", ...subjectsSet];
  }, [attempt]);

  // Main list of questions filtered by subject for display (including passages)
  const filteredQuestions = useMemo(() => {
    if (!attempt) return [];
    
    // Filter by subject
    return selectedSubject === "all"
      ? attempt.questions
      : attempt.questions.filter((q) => q.subject === selectedSubject);
    
  }, [attempt, selectedSubject]); 

  // The question currently displayed in the main pane
  const current = useMemo(() => filteredQuestions[currentIndex], [filteredQuestions, currentIndex]);


  // List used specifically for the Question Navigation Panel (excluding passages and strictly by subject)
  const navigationQuestions = useMemo(() => {
      if (!attempt) return [];
      
      const allNonPassageQuestions = attempt.questions.filter(q => q.questionType !== 'passage');
      
      // If 'all' is selected, return all non-passage questions.
      if (selectedSubject === "all") {
          return allNonPassageQuestions;
      }

      // If a specific subject is selected, filter the non-passage questions by subject.
      return allNonPassageQuestions.filter(q => q.subject === selectedSubject);
  }, [attempt, selectedSubject]);

  
  /* --------------------------------------
    SUBMIT TEST (MUST BE DEFINED BEFORE handleTimeUp)
  -------------------------------------- */
 const handleSubmit = useCallback(async (isAutoSubmit = false) => {
  if (!isAutoSubmit) {
    if (!window.confirm("Are you sure you want to submit the exam? This cannot be undone.")) {
      return;
    }
  }

  if (isSubmitting) return;

  setIsSubmitting(true);
  const toastId = toast.loading(isAutoSubmit ? "Auto-submitting test..." : "Submitting test...");

  const formattedAnswers = Object.entries(answers).map(([id, a]) => ({
    questionId: id,
    selectedAnswer:
      a.manual?.trim() !== ""
        ? a.manual
        : a.selected?.length
        ? a.selected[0]
        : null,
  }));

  const finalData = {
    answers: formattedAnswers,
    status: 'finished',
  };

  try {
    // ✅ FIXED API ROUTE (matches backend exactly)
    await api.post(`/api/student/submit-test/${attemptId}`, finalData);

    toast.success(
      isAutoSubmit ? "Test automatically submitted." : "Test submitted successfully!",
      { id: toastId }
    );

    navigate("/student-dashboard");
  } catch (err) {
    console.error("Submission Error:", err);
    toast.error(err.response?.data?.message || "Error submitting test", { id: toastId });
    setIsSubmitting(false);
  }
}, [attemptId, answers, navigate, isSubmitting]);

  /* --------------------------------------
    TIME UP HANDLER (Calls handleSubmit, must be defined AFTER it)
  -------------------------------------- */
  const handleTimeUp = useCallback(() => {
    toast.error("Time up! Auto-submitting...");
    handleSubmit(true); // Call the defined handleSubmit function
  }, [handleSubmit]); // Depend on handleSubmit

  /* --------------------------------------
    FETCH ATTEMPT
  -------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/student/attempt/${attemptId}`);
        setAttempt(data);

        const restored = {};
        data.questions.forEach((q) => {
            const existingAnswer = data.answers.find(a => a.questionId === q._id);
            const selected = existingAnswer 
                ? (typeof existingAnswer.selectedAnswer === "number" ? [existingAnswer.selectedAnswer] : [])
                : [];
            const manual = existingAnswer 
                ? (typeof existingAnswer.selectedAnswer === "string" ? existingAnswer.selectedAnswer : "")
                : "";

            restored[q._id] = { selected, manual };
        });
        setAnswers(restored);

      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load test");
        navigate("/student-dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attemptId, navigate]);

  
  // Adjusted logic for current index: just ensure it stays within bounds
  useEffect(() => {
      if (currentIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
          setCurrentIndex(filteredQuestions.length - 1);
      } else if (currentIndex < 0 && filteredQuestions.length > 0) {
          setCurrentIndex(0);
      }
  }, [filteredQuestions, currentIndex]);


  /* --------------------------------------
    LOADING / ERROR STATE / ENDED
  -------------------------------------- */
  if (loading || !attempt) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <ClipLoader size={50} color={"#06b6d4"} />
      </div>
    );
  }

  // Handle attempt ended
  if (attempt.status === 'finished' || attempt.status === 'completed') {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
              <h1 className="text-3xl font-bold text-green-600 mb-4">Exam Completed!</h1>
              <p className="text-lg text-gray-700 mb-8 text-center">
                  This test attempt is already finished. You can view your results in the performance section.
              </p>
              <button 
                  onClick={() => navigate("/student-dashboard")}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition"
              >
                  Go to Dashboard
              </button>
          </div>
      );
  }

  const endsAt = attempt.endsAt;
  const totalQuestionCount = filteredQuestions.length;
  // Use index of the current question within the filtered list to display question number
  const questionNumber = filteredQuestions.indexOf(current) + 1; 
  
  // Total answered questions calculation across ALL questions (excluding passages)
  const allQuestions = attempt.questions;
  const totalAnswered = allQuestions.filter(q => 
    q.questionType !== 'passage' && 
    (answers[q._id]?.selected?.length || (answers[q._id]?.manual && answers[q._id].manual.trim().length > 0))
  ).length;


  /* --------------------------------------
    PAGE RENDER
  -------------------------------------- */
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-inter">

      {/* --- FIXED HEADER (Top Bar) --- */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white shadow-lg border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3 sm:px-6">
          
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsNavOpen(true)}
              className="lg:hidden p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle Question Palette"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block truncate">
              {attempt.mocktestId?.title || 'Mock Test'}
            </h1>
          </div>
          
          {/* Timer */}
          <Timer
            expiryTimestamp={new Date(endsAt).getTime()}
            onTimeUp={handleTimeUp}
          />
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      {/* Added pt-[60px] to offset content below the fixed header */}
      <div className="flex flex-grow overflow-hidden pt-[60px]"> 
        
        {/* --- LEFT QUESTION CONTENT (Main Area) --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Question Status/Subject Controls (Sticky underneath Header, z-index maintained) */}
          <div className="sticky top-0 z-10 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center border-b border-gray-200">
            <h2 className="text-lg font-semibold text-cyan-700 mb-2 sm:mb-0">
              Question {questionNumber} of {totalQuestionCount} 
              <span className="text-gray-500 ml-4 font-normal text-sm">
                 ({totalAnswered} Answered)
              </span>
            </h2>
            
            {/* Subject Filter (Dropdown) */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentIndex(0); 
                }}
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              >
                <option value="all">All Sections</option>
                {subjects.slice(1).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>


          {/* Question Container (Scrollable) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-grow custom-scrollbar">
            {/* Check if current is defined before rendering */}
            {current && current._id ? (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <QuestionRenderer 
                  question={current} 
                  answers={answers} 
                  handleAnswer={handleAnswer} 
                />
              </div>
            ) : (
              <div className="text-center p-10 bg-white rounded-xl shadow-lg text-gray-500">
                {filteredQuestions.length === 0 ? "No questions match the current subject filter." : "No questions found in this section or test."}
              </div>
            )}
          </div>

          {/* --- FIXED FOOTER (Navigation Buttons) --- */}
          <div className="sticky bottom-0 z-10 bg-white p-4 shadow-t-lg border-t border-gray-200 flex justify-between items-center">
            
            {/* Navigation Buttons */}
            <div className="flex space-x-3">
                <button
                  disabled={currentIndex === 0 || filteredQuestions.length === 0}
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  className="px-4 py-2 flex items-center bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors font-semibold"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </button>

                <button
                  disabled={currentIndex === filteredQuestions.length - 1 || filteredQuestions.length === 0}
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="px-4 py-2 flex items-center bg-cyan-600 text-white rounded-lg disabled:opacity-50 hover:bg-cyan-700 transition-colors font-semibold"
                >
                  Next 
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
            </div>
            
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 flex items-center justify-center font-bold rounded-xl transition-all duration-300 shadow-lg transform active:scale-95 ${
                  isSubmitting 
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <ClipLoader size={20} color={"#ffffff"} className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Final Submit
                </>
              )}
            </button>
          </div>
        </div>

        {/* --- RIGHT QUESTION NAVIGATION (Desktop Sidebar) --- */}
        <aside className="hidden lg:block w-72 flex-shrink-0 border-l border-gray-200 overflow-y-auto custom-scrollbar">
          <QuestionNavigationPanel 
              questions={navigationQuestions} 
              currentIndex={currentIndex} 
              setCurrentIndex={setCurrentIndex} 
              answers={answers}
              isMobile={false}
          />
        </aside>

      </div>

      {/* --- MOBILE MODAL FOR NAVIGATION PANEL --- */}
      {isNavOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex lg:hidden">
          <div className="w-full h-full bg-white max-w-sm absolute right-0 shadow-2xl">
            <QuestionNavigationPanel 
              questions={navigationQuestions} 
              currentIndex={currentIndex} 
              setCurrentIndex={setCurrentIndex} 
              answers={answers}
              isMobile={true}
              onClose={() => setIsNavOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WriteMocktest;