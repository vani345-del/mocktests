// frontend/src/components/admin/EditMocktestPage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getMockTestById, updateMockTest } from "../../redux/mockTestSlice";
import FormMocktest from "./FormMocktest";
import { ClipLoader } from "react-spinners";

// Helper function to format date for datetime-local input
const formatDateTimeForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Returns date in "YYYY-MM-DDTHH:mm" format
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

// Helper to map API data to form state
const mapMockTestToForm = (test) => {
  return {
    ...test,
    // When we get data from the API, the category is an object.
    // We pass the whole object to the form.
    category: test.category,
    scheduledFor: formatDateTimeForInput(test.scheduledFor),
    // Ensure numeric fields are converted to strings for the form state
    durationMinutes: test.durationMinutes?.toString() || "",
    totalMarks: test.totalMarks?.toString() || "",
    negativeMarking: test.negativeMarking?.toString() ?? "",
    price: test.price?.toString() ?? "",
    discountPrice: test.discountPrice?.toString() ?? "",
    subjects: test.subjects.map((s) => ({
      name: s.name,
      easy: s.easy?.toString() || "",
      medium: s.medium?.toString() || "",
      hard: s.hard?.toString() || "",
    })),
  };
};

export default function EditMocktestPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { currentMockTest, loading } = useSelector((state) => state.mockTests);

  useEffect(() => {
    dispatch(getMockTestById(id));
  }, [dispatch, id]);

  const handleUpdateTest = async (payload, publish) => {
    // Add the id to the payload for the update thunk
    const updatePayload = { ...payload, id, isPublished: publish };

    try {
      const resultAction = await dispatch(updateMockTest(updatePayload));
      if (updateMockTest.fulfilled.match(resultAction)) {
        alert("Mock Test updated successfully!");
        // Navigate back to the category page
        navigate(`/admin/categories/${resultAction.payload.category.slug}`);
      } else {
        alert(
          "Failed to update mock test: " + resultAction.payload?.message
        );
        throw new Error(resultAction.payload?.message);
      }
    } catch (err) {
      console.error(err);
      throw err; // Re-throw to be caught by FormMocktest
    }
  };

  if (loading || !currentMockTest) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <ClipLoader color="#34d399" size={50} />
      </div>
    );
  }

  // Map the fetched test data to the format our form expects
  const initialData = mapMockTestToForm(currentMockTest);

  return (
    <FormMocktest
      formTitle="Edit Mock Test"
      onSubmitHandler={handleUpdateTest}
      initialData={initialData}
    />
  );
}