// src/components/admin/AdminLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Page content */}
      <main className="ml-64 w-full min-h-screen bg-gray-100 p-6">
        <Outlet /> {/* Nested page content renders here */}
      </main>
    </div>
  );
};

export default AdminLayout;
