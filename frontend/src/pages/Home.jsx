// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/sections/HeroSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import CategoriesSection from "../components/sections/CategoriesSection";
import FeaturedTestsSection from "../components/sections/FeaturedTestsSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import { fetchCategories } from "../redux/categorySlice";
import { fetchPublicMockTests } from "../redux/mockTestSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { items: categories, loading: categoryLoading } = useSelector(
    (state) => state.category
  );

  // grab the raw mocktest state
  const mocktestState = useSelector((state) => state.mocktest);
  const publicStatus = mocktestState.publicStatus;
  const rawPublicMocktests = mocktestState.publicMocktests;

  // normalize to an array no matter what shape it is
  const publicMocktests = Array.isArray(rawPublicMocktests)
    ? rawPublicMocktests
    : (rawPublicMocktests && rawPublicMocktests.mocktests) || [];

  useEffect(() => {
    dispatch(fetchCategories());
    // fetch latest 4 published tests for home
    dispatch(fetchPublicMockTests("?limit=4"));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = search ? `?q=${encodeURIComponent(search)}&limit=50` : "?limit=50";
    dispatch(fetchPublicMockTests(query));
    navigate(`/mocktests?q=${encodeURIComponent(search)}`);
  };

  const handleCategoryClick = (category) => {
    const slug = category.slug || category._id || category;
    dispatch(fetchPublicMockTests(`?category=${encodeURIComponent(slug)}&limit=50`));
    navigate(`/mocktests?category=${encodeURIComponent(slug)}`);
  };

  // ----- Defensive logic for filtering by type -----
  // If items contain a 'type' field, use it to split Mock/Grand.
  // If not, we fallback to showing all items in the Mock section (home).
  const hasTypeField = publicMocktests.some((t) => t && Object.prototype.hasOwnProperty.call(t, "type"));

  const mockTests = hasTypeField
    ? publicMocktests.filter((t) => t.type === "Mock").slice(0, 4)
    : publicMocktests.slice(0, 4); // fallback: show latest 4

  const grandTests = hasTypeField
    ? publicMocktests.filter((t) => t.type === "Grand").slice(0, 4)
    : []; // fallback: if no type, we won't duplicate same items in Grand section

  // DEBUG logs - remove after verifying
  console.log("DEBUG: publicStatus =", publicStatus);
  console.log("DEBUG: rawPublicMocktests:", rawPublicMocktests);
  console.log("DEBUG: normalized publicMocktests length:", publicMocktests.length);
  console.log("DEBUG: mockTests to render:", mockTests);
  console.log("DEBUG: grandTests to render:", grandTests);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        <HeroSection
          search={search}
          setSearch={setSearch}
          onSubmit={handleSearch}
        />
        <FeaturesSection />
        <CategoriesSection
          categories={categories}
          loading={categoryLoading}
          onCategoryClick={handleCategoryClick}
        />

        <FeaturedTestsSection
          id="mock-tests"
          title="Featured Mock Tests"
          tests={mockTests}
          loading={publicStatus === "loading"}
          showViewAll
          onViewAll={() => {
            dispatch(fetchPublicMockTests("?limit=50"));
            navigate("/mocktests");
          }}
        />

        <div className="bg-gray-50">
          <FeaturedTestsSection
            id="grand-tests"
            title="All-India Grand Tests"
            tests={grandTests}
            loading={publicStatus === "loading"}
            showViewAll
            onViewAll={() => {
              dispatch(fetchPublicMockTests("?limit=50"));
              navigate("/mocktests");
            }}
          />
        </div>

        <TestimonialsSection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
