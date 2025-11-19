import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

/* --------------------------------------
   TIMER
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
   MAIN COMPONENT
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

  /* --------------------------------------
      FETCH ATTEMPT
  -------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/student/attempt/${attemptId}`);
        setAttempt(data);

        let restored = {};
        if (data.answers) {
          data.answers.forEach((a) => {
            restored[a.questionId] = {
              selected:
                typeof a.selectedAnswer === "number"
                  ? [a.selectedAnswer]
                  : [],
              manual:
                typeof a.selectedAnswer === "string" ? a.selectedAnswer : "",
            };
          });
        }
        setAnswers(restored);
      } catch (err) {
        toast.error("Failed to load test");
        navigate("/student-dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attemptId, navigate]);

  /* --------------------------------------
      SUBJECT FILTERING
  -------------------------------------- */
  const subjects = useMemo(() => {
    if (!attempt) return [];
    const set = new Set(attempt.questions.map((q) => q.subject));
    return ["all", ...set];
  }, [attempt]);

  const filteredQuestions = useMemo(() => {
    if (!attempt) return [];
    return selectedSubject === "all"
      ? attempt.questions
      : attempt.questions.filter((q) => q.subject === selectedSubject);
  }, [attempt, selectedSubject]);

  const current = filteredQuestions[currentIndex];

  /* --------------------------------------
      SAVE ANSWER
  -------------------------------------- */
  const handleAnswer = (qid, type, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: {
        selected: type === "mcq" ? [value] : [],
        manual: type === "manual" ? value : "",
      },
    }));
  };

  /* --------------------------------------
      SUBMIT TEST
  -------------------------------------- */
const handleSubmit = async () => {
  if (!window.confirm("Are you sure you want to submit?")) return;

  setIsSubmitting(true);
  const toastId = toast.loading("Submitting...");

  const formatted = Object.entries(answers).map(([id, a]) => ({
    questionId: id,
    selectedAnswer:
      a.manual?.trim() !== ""
        ? a.manual
        : a.selected?.length
        ? a.selected[0]
        : null,
  }));
 


 try {
  await api.post(`/api/admin/mocktests/${attempt.mocktestId._id}/submit`, {
  userId: attempt.userId,
  answers: formatted,
});

  toast.success("Submitted!", { id: toastId });
  navigate("/student-dashboard");
} catch (err) {
  toast.error("Error submitting test", { id: toastId });
  setIsSubmitting(false);
}

    
};




  const handleTimeUp = () => {
    toast.error("Time up! Auto-submitting...");
    handleSubmit();
  };

  if (loading || !attempt) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <ClipLoader size={50} />
      </div>
    );
  }

  const endsAt = attempt.endsAt;

  /* --------------------------------------
      RENDER PASSAGE IF CHILD QUESTION
  -------------------------------------- */
  const renderPassage = (q) => {
    if (!q.parentPassage) return null;
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
        <h4 className="font-semibold mb-2 text-blue-900">Passage</h4>

        {q.parentPassage.text && (
          <p className="whitespace-pre-line mb-3">
            {q.parentPassage.text}
          </p>
        )}

        {q.parentPassage.imageUrl && (
          <img
            src={`${BASE_URL}/${q.parentPassage.imageUrl}`}
            className="max-h-80 object-contain rounded"
            alt="passage"
          />
        )}
      </div>
    );
  };

  /* --------------------------------------
      RENDER A PASSAGE QUESTION ITSELF
  -------------------------------------- */
  const renderPassageItem = (q) => {
    return (
      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded mb-6">
        <h4 className="font-semibold text-purple-900 mb-2">
          Passage
        </h4>

        {q.questionText && (
          <p className="whitespace-pre-line mb-3">{q.questionText}</p>
        )}

        {q.questionImageUrl && (
          <img
            src={`${BASE_URL}/${q.questionImageUrl}`}
            className="max-h-80 object-contain rounded"
            alt="passage"
          />
        )}

        <p className="text-sm italic mt-2 text-purple-700">
          Questions based on this passage follow next →
        </p>
      </div>
    );
  };

  /* --------------------------------------
      RENDER QUESTION BLOCK
  -------------------------------------- */
  const renderQuestion = (q) => {
    // 1️⃣ PASSAGE TYPE
    if (q.questionType === "passage") {
      return renderPassageItem(q);
    }

    // 2️⃣ CHILD QUESTION → SHOW PASSAGE ABOVE
    const passageBlock = renderPassage(q);

    return (
      <div>
        {passageBlock}

        <h3 className="text-lg font-semibold mb-3">
          {q.questionText}
        </h3>

        {q.questionImageUrl && (
          <img
            src={`${BASE_URL}/${q.questionImageUrl}`}
            className="max-h-80 object-contain rounded mb-4"
            alt="question"
          />
        )}

        {/* MCQ */}
        {q.questionType === "mcq" ? (
          q.options.map((opt, idx) => {
            const chosen = answers[q._id]?.selected?.[0] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(q._id, "mcq", idx)}
                className={`w-full text-left p-3 border rounded mb-3 flex gap-3 items-center ${
                  chosen
                    ? "bg-blue-100 border-blue-600"
                    : "bg-white"
                }`}
              >
                {opt.imageUrl && (
                  <img
                    src={`${BASE_URL}/${opt.imageUrl}`}
                    className="w-16 h-16 object-contain rounded"
                    alt=""
                  />
                )}
                <span>{opt.text || "Empty option"}</span>
              </button>
            );
          })
        ) : (
          // MANUAL
          <textarea
            rows="4"
            className="w-full border p-3 rounded"
            value={answers[q._id]?.manual || ""}
            onChange={(e) =>
              handleAnswer(q._id, "manual", e.target.value)
            }
          />
        )}
      </div>
    );
  };

  /* --------------------------------------
      PAGE RENDER
  -------------------------------------- */
  return (
    <div className="flex h-[calc(100vh-80px)] mt-10">
      
      {/* SUBJECT LIST */}
      <div className="w-1/5 bg-gray-50 border-r p-4">
        <h2 className="text-lg font-semibold mb-3">Subjects</h2>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSelectedSubject(s);
              setCurrentIndex(0);
            }}
            className={`block w-full px-3 py-2 mb-2 rounded ${
              selectedSubject === s
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* RIGHT CONTENT */}
      <div className="w-4/5 flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between p-4 bg-white border-b">
          <h1 className="font-bold text-lg">{attempt.mocktestId?.title}</h1>
          <Timer
            expiryTimestamp={new Date(endsAt).getTime()}
            onTimeUp={handleTimeUp}
          />
        </div>

        {/* QUESTION VIEW */}
        <div className="p-6 bg-gray-100 overflow-y-auto flex-grow">
          {!current ? (
            <p>No questions.</p>
          ) : (
            <div className="bg-white p-6 rounded shadow">
              {renderQuestion(current)}
            </div>
          )}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-between p-4 bg-white border-t">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="px-6 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            disabled={currentIndex === filteredQuestions.length - 1}
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default WriteMocktest;
