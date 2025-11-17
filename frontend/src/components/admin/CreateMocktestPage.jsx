// frontend/src/components/admin/CreateMocktestPage.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createMockTest } from "../../redux/mockTestSlice";
import FormMocktest from "./FormMocktest";

export default function CreateMocktestPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { category } = useParams();

  const handleCreateTest = async (payload, publish) => {
    // This is the logic that used to be inside FormMocktest
    try {
      const resultAction = await dispatch(
        createMockTest({ ...payload, isPublished: publish })
      );
      if (createMockTest.fulfilled.match(resultAction)) {
        const id = resultAction.payload._id;
        // Navigate to the "add questions" page for the new test
        navigate(`/admin/mocktests/${id}/new/questions`); 
      } else {
        const errorMsg = resultAction.payload?.message || "Failed to create mock test";
        alert(errorMsg);
        // Re-throw to be caught by FormMocktest's internal handler
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      // Re-throw to be caught by FormMocktest's internal handler
      throw err;
    }
  };

  // Pass the category from the URL as part of the initialData
  const initialData = { category: category };

  return (
    <FormMocktest
      formTitle="Create Mock Test"
      onSubmitHandler={handleCreateTest}
      initialData={initialData}
    />
  );
}