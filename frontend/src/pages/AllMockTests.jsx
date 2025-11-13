import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicMockTests } from "../redux/mockTestSlice";
import { fetchCategories } from "../redux/categorySlice";
import FiltersPanel from "../components/FiltersPanel";
import FeaturedTestsSection from "../components/sections/FeaturedTestsSection";
import { IoSearch } from "react-icons/io5";

export default function AllMockTests() {
  const dispatch = useDispatch();

  // Redux state
  const { publicMocktests, publicStatus, publicError } = useSelector(
    (state) => state.mocktest
  );

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );

  // Local state
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Initial load
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPublicMockTests("")); // Load all tests initially
  }, [dispatch]);

  // Build query string and dispatch
  const handleFetchTests = () => {
    const query = new URLSearchParams();

    if (q) query.set("q", q);
    if (selectedCategory) query.set("category", selectedCategory);

    dispatch(fetchPublicMockTests(`?${query.toString()}`));
  };

  // Category selected in sidebar
  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);

    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (slug) query.set("category", slug);

    dispatch(fetchPublicMockTests(`?${query.toString()}`));
  };

  // Search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFetchTests();
  };

  // --- Add to Cart Handler ---
  const handleAddToCart = (test) => {
    // This is where you will dispatch your Redux action
    console.log("Adding test to cart:", test.title);
    alert(`${test.title} added to cart! (Not really... yet)`);
    // Example: dispatch(addToCart(test));
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ---------------- SIDEBAR FILTERS ---------------- */}
          <aside className="md:col-span-1">
            <FiltersPanel
              categories={categories}
              loading={categoriesLoading}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
          </aside>

          {/* ---------------- MAIN CONTENT ---------------- */}
          <main className="md:col-span-3">
            {/* Page heading */}
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
              <p className="text-slate-600 mt-1 text-lg">
                Search, explore, and filter all available mock tests.
              </p>
            </header>

            {/* ----------- Search Bar ----------- */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex mb-8 shadow-sm"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tests by name..."
                className="flex-grow border-gray-300 p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-base"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <IoSearch className="h-5 w-5" />
              </button>
            </form>

            {/* ----------- TEST GRID USING FeaturedTestsSection ----------- */}
            <FeaturedTestsSection
              id="all-tests-grid"
              title="All Mock Tests"
              tests={publicMocktests || []}
              loading={publicStatus === "loading"}
              showViewAll={false} // Already in All Tests page
              onAddToCart={handleAddToCart} // <-- Pass the handler down
            />

            {/* ----------- ERROR HANDLING ----------- */}
            {publicStatus === "failed" && (
              <div className="mt-6 text-red-600 bg-red-100 p-4 rounded-lg border border-red-300">
                <strong>Error:</strong> {publicError}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}