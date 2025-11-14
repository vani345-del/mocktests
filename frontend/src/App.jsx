// frontend/src/App.jsx
import React from "react";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./components/ScrollToTop";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./components/admin/DashboardPage";
import ManageInstructors from "./components/admin/ManageInstructors";
import ManageStudents from "./components/admin/ManageStudents";
import ManageMocktests from "./components/admin/ManageMocktests";
import WriteMocktest from "./pages/WriteMocktest";
import CategoryPage from "./components/admin/CategoryPage";
import EditMocktestPage from "./components/admin/EditMocktestPage";
import AdminQuestions from "./components/admin/AdminQuestions";
import AllMockTests from "./pages/AllMockTests";
import MockTestDetail from "./pages/MockTestDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { Toaster } from 'react-hot-toast';

// Import the student dashboard
import StuDashboard from "./components/student/StuDashboard"; 

// Layout for public routes
const MainLayout = ({ children }) => {
  const location = useLocation();

  // Hide Navbar/Footer on login, signup, and admin pages
  const hideLayout =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
      {!hideLayout && <Navbar />}
      <main className="min-h-[80vh]">{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
};

const App = () => {
  const { userData } = useSelector((state) => state.user);

  return (
    <>
      <ToastContainer />
      <ScrollToTop />

      <MainLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/signup"
            element={!userData ? <Signup /> : <Navigate to="/" replace />}
          />

          {/* --- 1. UPDATED LOGIN ROUTE --- */}
          <Route
            path="/login"
            element={
              !userData ? (
                <Login />
              ) : userData.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                // [ --- NEW LOGIC HERE --- ]
                // Check if student has purchased tests.
                // If yes (length > 0), go to dashboard.
                // If no (length === 0), go to the public mocktests list.
                userData.purchasedTests && userData.purchasedTests.length > 0 ? (
                  <Navigate to="/student-dashboard" replace />
                ) : (
                  <Navigate to="/mocktests" replace />
                )
              )
            }
          />

           <Route path="/student/test/:attemptId" element={<WriteMocktest />} />
           <Route path="/mocktests" element={<AllMockTests />} />
           <Route path="/mocktests/:id" element={<MockTestDetail />} /> 

          {/* --- Cart & Checkout Routes (No change needed here) --- */}
          <Route path="/cart" element={<Cart />} />
          <Route 
            path="/checkout" 
            element={
              userData ? <Checkout /> : <Navigate to="/login" replace />
            } 
          />

          {/* --- 2. UPDATED STUDENT DASHBOARD ROUTE --- */}
          <Route
            path="/student-dashboard"
            element={
              // First, check if user is a logged-in student
              userData && userData.role === 'student' ? (
                // [ --- NEW LOGIC HERE --- ]
                // If they are a student, check if they have purchased tests.
                // If yes, show the dashboard.
                userData.purchasedTests && userData.purchasedTests.length > 0 ? (
                  <StuDashboard />
                ) : (
                  // If no, redirect them to the mocktests list.
                  <Navigate to="/mocktests" replace />
                )
              ) : (
                // If not a logged-in student, send to login
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ✅ Admin layout (Sidebar + nested pages) */}
          <Route
            path="/admin"
            element={
              userData?.role === "admin" ? (
                <AdminLayout />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="instructors" element={<ManageInstructors />} />
            <Route path="students" element={<ManageStudents />} />
             <Route path="/admin/mocktests" element={<ManageMocktests />} />
            <Route path="/admin/mocktests/:category" element={<CategoryPage />} />
            <Route path="/admin/mocktests/:category/edit/:id" element={<EditMocktestPage />} />
            <Route path="/admin/mocktests/:id/questions" element={<AdminQuestions />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </>
  );
};

export default App;