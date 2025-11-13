// src/components/sections/CategoriesSection.jsx
import React from "react";

const CategoriesSection = ({ categories, loading }) => (
  <section id="categories" className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">
        Browse by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}

        {!loading &&
          categories.map((category) => (
            <a
              key={category._id}
              href={`/tests/${category.slug}`}
              className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                {category.name}
              </h3>
            </a>
          ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
