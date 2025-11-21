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

import MockTestCard from "../components/MockTestCard";
import PremiumTestCard from "../components/PremiumTestCard";

import { fetchCategories } from "../redux/categorySlice";
import { fetchPublicMockTests } from "../redux/studentSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { items: categories, loading: categoryLoading } = useSelector(
    (state) => state.category
  );

  const { publicMocktests, publicStatus } = useSelector(
    (state) => state.students
  );

  // 🔥 Split tests properly
const mockTests = publicMocktests
  .filter(t => !t.isGrandTest)   // remove grand tests
  .slice(0, 4);

const grandTests = publicMocktests.filter(t => t.isGrandTest === true);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPublicMockTests("?limit=12")); // get enough to split
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/mocktests?q=${encodeURIComponent(search)}`);
  };

  const handleCategoryClick = (category) => {
    const slug = category.slug || category._id || category;
    navigate(`/mocktests?category=${encodeURIComponent(slug)}`);
  };

  

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main>
        <HeroSection search={search} setSearch={setSearch} onSubmit={handleSearch} />

        <FeaturesSection />

        <CategoriesSection
          categories={categories}
          loading={categoryLoading}
          onCategoryClick={handleCategoryClick}
        />

        {/* ⭐ PREMIUM MOCK TESTS */}
        <FeaturedTestsSection
          id="mock-tests"
          title="Top Rated Mock Series"
          tests={mockTests}
          loading={publicStatus === "loading"}
          showViewAll
          CardComponent={MockTestCard}
          onViewAll={() => navigate("/mocktests")}
        />

        {/* ⭐ GRAND TEST SECTION */}
        <div className="bg-gray-900 border-t border-b border-gray-800">
          <FeaturedTestsSection
            id="grand-tests"
            title="All-India Grand Tests - Live Ranks"
            tests={grandTests}
            loading={publicStatus === "loading"}
            showViewAll
            CardComponent={PremiumTestCard}
            onViewAll={() => navigate("/mocktests")}
          />
        </div>

        <TestimonialsSection />
      </main>
    </div>
  );
};

export default Home;
