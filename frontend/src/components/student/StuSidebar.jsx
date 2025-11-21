// frontend/src/components/student/StuSidebar.jsx
import React, { useState } from "react";
import {
  BookOpen,
  TrendingUp,
  BarChart2,
  Settings,
  LogOut,
  Search,
  Menu
} from "lucide-react";

import SidebarLink from "./SidebarLink";

const StuSidebar = ({ activeTab, setActiveTab }) => {
  const [open, setOpen] = useState(false); // MOBILE SIDEBAR TOGGLE

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <>
      {/* ---------------- MOBILE TOP BAR ---------------- */}
      <div className="md:hidden fixed top-0 left-0 w-full p-4 bg-gray-900/95 backdrop-blur-md z-50 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold text-white">Student Dashboard</h1>

        <Menu
          className="text-white text-3xl cursor-pointer"
          onClick={() => setOpen(true)}
        />
      </div>

      {/* ---------------- OVERLAY (Mobile) ---------------- */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* ---------------- SIDEBAR ---------------- */}
      <aside
        className={`bg-gray-900/95 backdrop-blur-lg shadow-2xl shadow-gray-900/50
          fixed top-0 left-0 h-screen w-64 z-50
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0   /* ALWAYS VISIBLE ON DESKTOP */
        `}
      >
        {/* PROFILE */}
        <div className="flex flex-col items-center py-6 border-b border-gray-800 mt-14 md:mt-4">
          <img
            src="https://placehold.co/150x150/1C3C6B/ffffff?text=ST"
            className="w-16 h-16 rounded-full border-2 border-blue-600 shadow-xl"
            alt="Student Profile"
          />
          <h4 className="text-white font-semibold mt-3 text-lg tracking-wide">
            Student Name
          </h4>
          <p className="text-blue-400 text-sm font-medium">Student</p>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-4 flex-1 overflow-y-auto px-4 space-y-2 scrollbar-hidden">
          <SidebarLink
            icon={<BarChart2 size={20} />}
            label="Overview"
            isActive={activeTab === "overview"}
            onClick={() => {
              setActiveTab("overview");
              setOpen(false);
            }}
          />

          <SidebarLink
            icon={<BookOpen size={20} />}
            label="My Mocktests"
            isActive={activeTab === "my-tests"}
            onClick={() => {
              setActiveTab("my-tests");
              setOpen(false);
            }}
          />

          <SidebarLink
            icon={<Search size={20} />}
            label="Explore Tests"
            isActive={activeTab === "explore"}
            onClick={() => {
              setActiveTab("explore");
              setOpen(false);
            }}
          />

          <SidebarLink
            icon={<TrendingUp size={20} />}
            label="My Performance"
            isActive={activeTab === "performance"}
            onClick={() => {
              setActiveTab("performance");
              setOpen(false);
            }}
          />

          <SidebarLink
            icon={<Settings size={20} />}
            label="Profile Settings"
            isActive={activeTab === "settings"}
            onClick={() => {
              setActiveTab("settings");
              setOpen(false);
            }}
          />
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-700/30 hover:bg-red-700/50 text-red-300 py-3 rounded-lg flex items-center gap-3 justify-center transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default StuSidebar;
