// src/components/SearchBar.jsx
import React from "react";
import { IconSearch } from "../icons/Icons";

const SearchBar = ({ value, onChange, onSubmit }) => (
  <form onSubmit={onSubmit} className="w-full max-w-xl mx-auto flex">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search for mock tests..."
      className="w-full px-5 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-l-full focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="submit"
      className="px-6 py-3 text-white bg-blue-600 rounded-r-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
    >
      <IconSearch />
    </button>
  </form>
);

export default SearchBar;

