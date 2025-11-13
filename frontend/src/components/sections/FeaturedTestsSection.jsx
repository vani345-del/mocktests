import React from "react";
import { Link } from "react-router-dom";

const FeaturedTestsSection = ({
  id,
  title,
  tests = [],
  loading,
  showViewAll,
  onViewAll,
}) => {
  return (
    <section id={id} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          {title}
        </h2>

        {/* Loading */}
        {loading && <p className="text-center text-gray-500">Loading...</p>}

        {/* No Tests */}
        {!loading && tests.length === 0 && (
          <p className="text-center text-gray-500 text-lg">
            No tests available right now.
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading &&
            tests.map((test) => (
              <div
                key={test._id}
                className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Top Banner */}
                <div
                  className={`h-40 w-full flex items-center justify-center text-white text-xl font-bold ${
                    test.type === "Grand" ? "bg-purple-600" : "bg-blue-600"
                  }`}
                >
                  {test.type === "Grand"
                    ? "All-India Grand Test"
                    : "Mock Test"}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">

                  {/* CATEGORY NAME ADDED HERE */}
                  {test.category?.name && (
                    <p className="text-sm font-semibold text-blue-700 mb-2">
                      {test.category.name}
                    </p>
                  )}

                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex-grow line-clamp-1">
                    {test.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {test.description}
                  </p>

                  {/* Price + View */}
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xl font-bold text-blue-600">
                      ₹{test.price}
                    </span>

                    <Link
                      to={`/mocktests/${test._id}`}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700"
                    >
                      View Test
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* View All Button */}
        {showViewAll && (
          <div className="text-center mt-12">
            <button
              onClick={onViewAll}
              className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-full shadow-md hover:bg-blue-700"
            >
              View All {title}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTestsSection;
