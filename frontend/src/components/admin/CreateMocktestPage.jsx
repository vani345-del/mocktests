// frontend/src/components/admin/CreateMocktestPage.jsx - FINAL VERSION
import React from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createMockTest } from "../../redux/mockTestSlice";
import FormMocktest from "./FormMocktest";
import { toast } from "react-hot-toast";

export default function CreateMocktestPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // Assuming URL looks like /admin/mocktests/new/:categorySlug
    const { category } = useParams(); 

    const handleCreateTest = async (payload, publish) => {
        try {
            toast.loading("Creating mock test...");
            const resultAction = await dispatch(
                createMockTest({ ...payload, isPublished: publish })
            );
            toast.dismiss();

            if (createMockTest.fulfilled.match(resultAction)) {
                toast.success("Mock test created! Questions automatically generated.");
                navigate(`/admin/mocktests/${payload.category}`); 
                
            } else {
                const errorMsg = resultAction.payload?.message || "Failed to create mock test";
                toast.error(errorMsg);
                throw new Error(errorMsg);
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const initialData = { category: category };

    // ⚠️ CRITICAL CHECK: Don't render FormMocktest if the category is missing.
    // This stabilizes the 'initialData' and ensures the necessary props exist.
    if (!category) {
        return <div className="text-center mt-10 text-white">Loading category...</div>;
    }

    return (
        <FormMocktest
            formTitle="Create Mock Test"
            onSubmitHandler={handleCreateTest} 
            initialData={initialData}
        />
    );
}