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

import CategoryPage from "./components/admin/CategoryPage";
import CreateMocktestPage from "./components/admin/CreateMocktestPage";
import FormMocktest from "./components/admin/FormMocktest";
import AdminQuestions from "./components/admin/AdminQuestions";

import WriteMocktest from "./pages/student/WriteMocktest";
import InstructionsPage from "./pages/student/InstructionsPage";
import StuDashboard from "./pages/student/StuDashboard";

import AllMockTests from "./pages/AllMockTests";
import MockTestDetail from "./pages/MockTestDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import { Toaster } from "react-hot-toast";

const MainLayout = ({ children }) => {
  const location = useLocation();
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
          {/* ---------------- PUBLIC ROUTES ---------------- */}
          <Route path="/" element={<Home />} />

          <Route
            path="/signup"
            element={!userData ? <Signup /> : <Navigate to="/" replace />}
          />

          <Route
            path="/login"
            element={
              !userData ? (
                <Login />
              ) : userData.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : userData.purchasedTests?.length > 0 ? (
                <Navigate to="/student-dashboard" replace />
              ) : (
                <Navigate to="/mocktests" replace />
              )
            }
          />

          <Route
            path="/student/instructions/:mocktestId"
            element={userData ? <InstructionsPage /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/student/test/:attemptId"
            element={userData ? <WriteMocktest /> : <Navigate to="/login" replace />}
          />

          <Route path="/mocktests" element={<AllMockTests />} />
          <Route path="/mocktests/:id" element={<MockTestDetail />} />

          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={userData ? <Checkout /> : <Navigate to="/login" replace />}
          />

          {/* ---------------- STUDENT DASHBOARD ---------------- */}
          <Route
            path="/student-dashboard"
            element={
              userData?.role === "student" ? (
                userData.purchasedTests?.length > 0 ? (
                  <StuDashboard />
                ) : (
                  <Navigate to="/mocktests" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ---------------- ADMIN ROUTES ---------------- */}
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
            {/* ADMIN HOME */}
            <Route index element={<DashboardPage />} />

            <Route path="instructors" element={<ManageInstructors />} />
            <Route path="students" element={<ManageStudents />} />

            {/* -------- MOCKTESTS -------- */}
            <Route path="mocktests" element={<ManageMocktests />} />

            {/* List page for category */}
            <Route path="mocktests/:category" element={<CategoryPage />} />

            {/* Create new mocktest */}
            <Route
              path="mocktests/:category/new"
              element={<CreateMocktestPage />}
            />

            {/* Edit mocktest */}
            <Route
              path="mocktests/:category/edit/:id"
              element={<FormMocktest />}
            />

            {/* Manage questions */}
            <Route
              path="mocktests/:id/questions"
              element={<AdminQuestions />}
            />
          </Route>

          {/* ---------------- FALLBACK ---------------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </>
  );
};

export default App;
