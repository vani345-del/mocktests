import React from 'react';

// Sidebar Link Component
const SidebarLink = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-6 py-3 text-left ${
      isActive
        ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    } transition-colors duration-150`}
  >
    <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
      {icon}
    </span>
    <span className="ml-4 text-sm font-medium">{label}</span>
  </button>
);

export default SidebarLink;