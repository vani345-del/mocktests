import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChalkboardTeacher, FaUserGraduate, FaClipboardList } from "react-icons/fa";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/admin" },
    { name: "Manage Instructors", icon: <FaChalkboardTeacher />, path: "/admin/instructors" },
    { name: "Manage Students", icon: <FaUserGraduate />, path: "/admin/students" },
    { name: "Manage Mocktests", icon: <FaClipboardList />, path: "/admin/mocktests" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 p-5 flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Panel</h2>
      <nav className="flex-1">
        <ul>
          {menuItems.map((item, idx) => (
            <li key={idx} className="mb-3">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    isActive ? "bg-gray-700" : "hover:bg-gray-800"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <button className="mt-auto bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium">
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
