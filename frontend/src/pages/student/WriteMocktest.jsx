
// frontend/src/pages/student/WriteMocktest.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

/* --------------------------------------
   BASE URL (Vite-safe)
-------------------------------------- */
const BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

/* --------------------------------------
   Timer Component
-------------------------------------- */
const Timer = ({ expiryTimestamp, onTimeUp }) => {
  const [remaining, setRemaining] = useState(expiryTimestamp - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const r = expiryTimestamp - Date.now();
      if (r <= 0) {
        clearInterval(interval);
        setRemaining(0);
        onTimeUp();
      } else {
        setRemaining(r);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp, onTimeUp]);

  const minutes = Math.floor((remaining / 1000 / 60) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <div className="text-2xl font-bold text-red-600">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
};

/* --------------------------------------
   WriteMocktest Component
-------------------------------------- */
const WriteMocktest = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* --------------------------------------
     Fetch Attempt Details
  -------------------------------------- */
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const { data } = await api.get(`/api/student/attempt/${attemptId}`);
        setAttempt(data);

        // Restore saved answers
        if (data.answers) {
          const restored = {};
          data.answers.forEach((a) => {
            restored[a.questionId] = {
              selected: a.selectedAnswer !== null ? [Number(a.selectedAnswer)] : [],
              manual: typeof a.selectedAnswer === "string" ? a.selectedAnswer : "",
            };
          });
          setAnswers(restored);
        }
      } catch (err) {
        toast.error("Could not load test");
        navigate("/student-dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId, navigate]);

  /* --------------------------------------
     Subjects List
  -------------------------------------- */
  const subjects = useMemo(() => {
    if (!attempt) return [];
    const unique = new Set(attempt.questions.map((q) => q.subject));
    return ["all", ...unique];
  }, [attempt]);

  /* --------------------------------------
     Filter by Subject
  -------------------------------------- */
  const filteredQuestions = useMemo(() => {
    if (!attempt) return [];
    if (selectedSubject === "all") return attempt.questions;
    return attempt.questions.filter((q) => q.subject === selectedSubject);
  }, [attempt, selectedSubject]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  /* --------------------------------------
     Handle Answer Selection
  -------------------------------------- */
  const handleAnswerChange = (questionId, type, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected: type === "mcq" ? [Number(value)] : [],
        manual: type === "manual" ? value : "",
      },
    }));
  };

  /* --------------------------------------
     Submit Test
  -------------------------------------- */
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!window.confirm("Are you sure you want to submit the test?")) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting...");

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, ans]) => ({
        questionId,
        selectedAnswer:
          ans.manual?.trim() !== ""
            ? ans.manual
            : ans.selected?.[0] ?? null,
      })
    );

    try {
      await api.post(`/api/student/submit-test/${attemptId}`, {
        answers: formattedAnswers,
      });
      toast.success("Test submitted successfully!", { id: toastId });
      navigate("/student-dashboard");
    } catch (err) {
      toast.error("Submit failed", { id: toastId });
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    toast.error("Time is up! Auto-submitting...");
    handleSubmit();
  };

  /* --------------------------------------
     Loader
  -------------------------------------- */
  if (loading || !attempt) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} />
      </div>
    );
  }

  const endsAt = attempt.endsAt;

  /* --------------------------------------
     Render
  -------------------------------------- */
  return (
    <div className="flex h-[calc(100vh-80px)] mt-10">
      
      {/* SUBJECTS LIST */}
      <div className="w-1/5 bg-gray-50 border-r p-4">
        <h2 className="text-lg font-semibold mb-3">Subjects</h2>
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => {
              setSelectedSubject(sub);
              setCurrentQuestionIndex(0);
            }}
            className={`block w-full px-3 py-2 mb-2 rounded ${
              selectedSubject === sub
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="w-4/5 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between p-4 bg-white border-b">
          <h1 className="font-bold text-lg">{attempt.mocktestId?.title}</h1>
          <Timer
            expiryTimestamp={new Date(endsAt).getTime()}
            onTimeUp={handleTimeUp}
          />
        </div>

        {/* Question */}
        <div className="p-6 bg-gray-100 overflow-y-auto flex-grow">
          {!currentQuestion ? (
            <p>No questions for this subject.</p>
          ) : (
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-3">
                Question {currentQuestionIndex + 1}
              </h3>

              {/* TEXT */}
              {currentQuestion.questionText && (
                <p className="mb-4">{currentQuestion.questionText}</p>
              )}

              {/* IMAGE */}
              {currentQuestion.questionImageUrl && (
                <img
                  src={`${BASE_URL}/${currentQuestion.questionImageUrl}`}
                  className="max-h-80 object-contain rounded mb-4"
                  alt="question"
                />
              )}

              {/* MCQ */}
              {currentQuestion.questionType === "mcq" ? (
                currentQuestion.options.map((opt, idx) => {
                  const selected =
                    answers[currentQuestion._id]?.selected?.[0] === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        handleAnswerChange(
                          currentQuestion._id,
                          "mcq",
                          idx
                        )
                      }
                      className={`w-full text-left p-3 border rounded mb-3 flex gap-3 items-center ${
                        selected
                          ? "bg-blue-100 border-blue-600"
                          : "bg-white"
                      }`}
                    >
                      {/* OPTION IMAGE */}
                      {opt.imageUrl && (
                        <img
                          src={`${BASE_URL}/${opt.imageUrl}`}
                          className="w-20 h-20 object-contain rounded"
                          alt=""
                        />
                      )}

                      {/* OPTION TEXT */}
                      {opt.text && <span>{opt.text}</span>}

                      {/* EMPTY OPTION */}
                      {!opt.text && !opt.imageUrl && (
                        <span className="italic text-gray-400">
                          Empty option
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                /* MANUAL */
                <textarea
                  rows="4"
                  className="w-full border p-3 rounded"
                  value={answers[currentQuestion._id]?.manual || ""}
                  onChange={(e) =>
                    handleAnswerChange(
                      currentQuestion._id,
                      "manual",
                      e.target.value
                    )
                  }
                />
              )}
            </div>
          )}
        </div>

        {/* NAVIGATION + SUBMIT */}
        <div className="flex justify-between p-4 bg-white border-t">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((i) => i - 1)}
            className="px-6 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            disabled={
              currentQuestionIndex === filteredQuestions.length - 1
            }
            onClick={() => setCurrentQuestionIndex((i) => i + 1)}
            className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default WriteMocktest;
