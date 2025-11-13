
// src/components/sections/HeroSection.jsx
import React from "react";
import SearchBar from "../SearchBar";

const HeroSection = ({ search, setSearch, onSubmit }) => (
  <section className="bg-gray-50 pt-24 pb-24 text-center">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
        Master Your Exams, <br />
        <span className="text-blue-600">Conquer Your Goals.</span>
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
        Access high-quality Mock Tests and compete in All-India Grand Tests.
        Get instant results, detailed analysis, and expert guidance.
      </p>
      <div className="mt-10">
        <SearchBar value={search} onChange={setSearch} onSubmit={onSubmit} />
      </div>
    </div>
  </section>
);

export default HeroSection;
