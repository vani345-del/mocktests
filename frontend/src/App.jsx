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
          <Route
            path="/login"
            element={!userData ? (<Login />) : userData.role === "admin" ? (<Navigate to="/admin" replace />) 
              : (<Navigate to="/student" replace />)
            }
          />
           <Route path="/student/test/:attemptId" element={<WriteMocktest />} />
           <Route path="/mocktests" element={<AllMockTests />} />
              <Route path="/mocktests/:id" element={<MockTestDetail />} /> 

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
