// src/components/FiltersPanel.jsx
import React from "react";

const FiltersPanel = ({ categories, loading, selectedCategory, onSelectCategory }) => (
  <div className="p-5 border border-gray-200 rounded-lg shadow-md bg-white sticky top-24">
    <h4 className="font-bold text-lg text-gray-900 mb-4 pb-3 border-b border-gray-200">
      Categories
    </h4>
    
    <div className="space-y-1">
      {/* All Categories Button */}
      <button
        onClick={() => onSelectCategory("")}
        className={`block w-full text-left py-2.5 px-3.5 rounded-md text-sm font-medium transition-all duration-150 ${
          !selectedCategory 
            ? "bg-blue-100 text-blue-700" 
            : "text-slate-600 hover:bg-gray-100 hover:text-slate-800"
        }`}
      >
        All Categories
      </button>
      
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-1 pt-2">
          <div className="h-7 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-7 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-7 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      )}

      {/* Category List */}
      {!loading && categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => onSelectCategory(cat.slug)}
          className={`block w-full text-left py-2.5 px-3.5 rounded-md text-sm font-medium transition-all duration-150 ${
            selectedCategory === cat.slug
              ? "bg-blue-100 text-blue-700"
              : "text-slate-600 hover:bg-gray-100 hover:text-slate-800"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  </div>
);

export default FiltersPanel;