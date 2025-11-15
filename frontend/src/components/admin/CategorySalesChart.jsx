// frontend/src/components/admin/CategorySalesChart.jsx
// (Create this new file)

import React from "react";
import { FaBookmark } from "react-icons/fa";

const CategorySalesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg h-full flex items-center justify-center text-gray-500">
        No category sales data yet.
      </div>
    );
  }

  // Find max sales to create a relative bar width
  const maxSales = Math.max(...data.map((item) => item.salesCount), 0);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Top 5 Selling Categories
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-600 capitalize">
                {item.category}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {item.salesCount} Sales
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{
                  width: `${maxSales > 0 ? (item.salesCount / maxSales) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySalesChart;