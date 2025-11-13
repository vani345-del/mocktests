// src/components/FiltersPanel.jsx
import React from "react";

const FiltersPanel = ({ categories, selectedCategory, onSelectCategory }) => (
  <div className="p-3 border rounded-lg">
    <h4 className="font-semibold mb-2">Categories</h4>
    <button
      onClick={() => onSelectCategory("")}
      className={`block w-full text-left py-1 px-2 rounded ${
        !selectedCategory ? "bg-blue-100 font-bold" : ""
      }`}
    >
      All
    </button>
    {categories.map((cat) => (
      <button
        key={cat._id}
        onClick={() => onSelectCategory(cat.slug)}
        className={`block w-full text-left py-1 px-2 rounded ${
          selectedCategory === cat.slug ? "bg-blue-100 font-bold" : ""
        }`}
      >
        {cat.name}
      </button>
    ))}
  </div>
);

export default FiltersPanel;
