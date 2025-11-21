// frontend/src/pages/AllMockTests.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoSearch, IoFunnel, IoClose } from "react-icons/io5";

import {
  fetchPublicMockTests,
  setPublicCategoryFilter,
  setPublicSearch,
} from "../redux/studentSlice";

import { fetchCategories } from "../redux/categorySlice";
import FiltersPanel from "../components/FiltersPanel";
import MockTestCard from "../components/MockTestCard";

// ADD isEmbedded PROP WITH DEFAULT VALUE
export default function AllMockTests({ isEmbedded = false }) {
  const dispatch = useDispatch();

  // Redux states
  const { publicMocktests, publicStatus, publicError, filters } = useSelector(
    (state) => state.students
  );

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  /* ============================================================
     (Query/Fetch/Handler logic remains unchanged)
  ============================================================ */
  const buildQuery = (filters) => {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const qs = buildQuery(filters);
    dispatch(fetchPublicMockTests(qs));
  }, [dispatch, filters]);

  const handleSearchChange = (e) => {
    dispatch(setPublicSearch(e.target.value));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const qs = buildQuery(filters);
    dispatch(fetchPublicMockTests(qs));
  };

  const handleSelectCategory = (catId) => {
    dispatch(setPublicCategoryFilter(catId));
    setIsFilterPanelOpen(false);
  };

  /* ============================================================
     UI - CONDITIONAL STYLING CHANGES
  ============================================================ */
  const containerClass = isEmbedded 
    ? "text-gray-900" 
    : "bg-gray-950 min-h-screen pt-28 pb-16 text-white";
    
  const contentWrapperClass = isEmbedded 
    ? "mx-auto" // Adjust for dashboard layout, remove max-width
    : "max-w-7xl mx-auto px-4";
  
  const headerClass = isEmbedded
    ? "mb-6 text-left" 
    : "mb-10 text-center";
    
  const titleClass = isEmbedded
    ? "text-2xl font-semibold text-gray-800"
    : "text-4xl font-extrabold";

  return (
    <div className={containerClass}>
      <div className={contentWrapperClass}>

        {/* HEADER - conditionally styled */}
        <header className={headerClass}>
          <h1 className={titleClass}>
            {isEmbedded ? "Explore More Tests" : "Explore All Mock Tests"}
          </h1>
          <p className={isEmbedded ? "text-gray-600 mt-1" : "text-gray-400 mt-3 text-lg"}>
            Search & filter test series
          </p>
        </header>
        {/* END HEADER */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* SIDEBAR - Remains the same */}
          <aside className="hidden md:block md:col-span-1">
            <FiltersPanel
              categories={categories}
              loading={categoriesLoading}
              selectedCategory={filters.category}
              onSelectCategory={handleSelectCategory}
            />
          </aside>

          {/* MAIN CONTENT */}
          <main className="md:col-span-3">

            {/* SEARCH BAR - conditionally styled */}
            <div className="flex gap-4 mb-8">
              <form
                onSubmit={handleSearchSubmit}
                // Adjust search bar styles for embedded use to match dashboard theme
                className={`flex flex-grow shadow-lg rounded-xl overflow-hidden border ${isEmbedded ? 'border-gray-300 bg-white' : 'border-gray-700 bg-gray-900'}`}
              >
                <input
                  value={filters.q}
                  onChange={handleSearchChange}
                  placeholder="Search tests..."
                  // Adjust input text color for light theme
                  className={`flex-grow p-4 outline-none ${isEmbedded ? 'bg-white text-gray-800' : 'bg-gray-900 text-white'}`}
                />
                <button
                  type="submit"
                  className="px-6 py-4 bg-cyan-600 text-white hover:bg-cyan-500"
                >
                  <IoSearch className="h-6 w-6" />
                </button>
              </form>

              {/* MOBILE FILTER BTN - Adjusted styles if needed */}
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="md:hidden p-3 bg-gray-900 text-cyan-400 border border-cyan-400 rounded-xl shadow-lg"
              >
                <IoFunnel className="h-6 w-6" />
              </button>
            </div>
            
            {/* MOBILE FILTER DRAWER - Remains the same */}
            {isFilterPanelOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-end md:hidden">
                <div className="bg-gray-950 w-full max-w-xs p-6">
                  <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">Filters</h2>
                    <button onClick={() => setIsFilterPanelOpen(false)}>
                      <IoClose className="h-8 w-8 text-gray-300" />
                    </button>
                  </div>

                  <FiltersPanel
                    categories={categories}
                    loading={categoriesLoading}
                    selectedCategory={filters.category}
                    onSelectCategory={handleSelectCategory}
                  />
                </div>
              </div>
            )}

            {/* LOADING */}
            {publicStatus === "loading" && (
              <div className="flex justify-center items-center h-48">
                <svg className="animate-spin h-8 w-8 text-cyan-400" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                  ></path>
                </svg>
                <p className="ml-3 text-lg text-gray-400">Loading tests...</p>
              </div>
            )}

            {/* RESULT LIST */}
            {publicStatus === "succeeded" && publicMocktests.length > 0 && (
              // Adjust grid for a slightly more compact view inside dashboard column
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {publicMocktests.map((test) => (
                  <MockTestCard 
                    key={test._id} 
                    test={test} 
                    isEmbedded={isEmbedded} // Pass for optional internal card styling adjustment
                  />
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {publicStatus === "succeeded" && publicMocktests.length === 0 && (
              <p className="text-center text-gray-400 text-xl mt-10">
                No mock tests found.
              </p>
            )}

            {/* ERROR */}
            {publicStatus === "failed" && (
              <div className="text-red-400 pt-4 text-center text-lg">
                {publicError}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}