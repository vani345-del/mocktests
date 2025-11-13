import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const WriteMocktest = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);

  // ✅ Load questions from localStorage
  useEffect(() => {
    const savedQuestions = localStorage.getItem("currentQuestions");
    const savedAttemptId = localStorage.getItem("currentAttemptId");

    if (!savedQuestions || savedAttemptId !== attemptId) {
      toast.error("No questions found. Please start the mocktest again.");
      navigate("/student/mocktests");
      return;
    }

    const parsed = JSON.parse(savedQuestions);
    setQuestions(parsed);
    setTimer(parsed.length * 60); // Example: 1 min per question
    setLoading(false);
  }, [attemptId, navigate]);

  // ✅ Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  // ✅ Format time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ✅ Record answer
  const handleAnswer = (qId, index) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: index,
    }));
  };

  // ✅ Submit test
  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        selectedIndex: answers[questionId],
      }));

      const res = await axios.post(
        `http://localhost:8000/api/student/submit-test/${attemptId}`,
        { answers: formattedAnswers }
      );

      toast.success(`Test submitted! Your score: ${res.data.score}`);
      localStorage.removeItem("currentQuestions");
      localStorage.removeItem("currentAttemptId");
      navigate("/student/mocktests");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting test");
    }
  };

  if (loading) {
    return <p className="text-center mt-20 text-lg">Loading your mocktest...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-20">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Mocktest in Progress</h1>
        <div className="bg-gray-800 text-white px-4 py-2 rounded">
          ⏱️ Time Left: {formatTime(timer)}
        </div>
      </div>

      {questions.map((q, index) => (
        <div key={q._id || index} className="mb-6 p-4 border rounded shadow">
          <h2 className="font-semibold mb-2">
            {index + 1}. {q.title}
          </h2>
          <div className="space-y-1">
            {q.options.map((opt, optIdx) => (
              <label
                key={optIdx}
                className={`block p-2 border rounded cursor-pointer ${
                  answers[q._id] === optIdx ? "bg-blue-100 border-blue-500" : ""
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q._id}`}
                  checked={answers[q._id] === optIdx}
                  onChange={() => handleAnswer(q._id, optIdx)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default WriteMocktest;
