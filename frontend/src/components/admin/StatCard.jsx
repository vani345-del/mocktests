// frontend/src/components/admin/StatCard.jsx
// (Create this new file)

import React from "react";

const StatCard = ({ icon, title, value, bgColor = "bg-blue-500" }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex items-center gap-5">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${bgColor} text-white text-3xl`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-4xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;