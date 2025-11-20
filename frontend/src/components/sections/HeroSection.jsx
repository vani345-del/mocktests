// src/components/sections/HeroSection.jsx
import React from "react";
import SearchBar from "../SearchBar";
import hero from "../../assets/hero.png";
import { BrainCircuit, BarChart3, Zap } from "lucide-react";

const HeroSection = ({ search, setSearch, onSubmit }) => {
  return (
    <section className="bg-gray-950 text-gray-100 pt-28 pb-20 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* ================= TOP ROW ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">

          {/* ================= LEFT TEXT ================= */}
          <div className="order-2 lg:order-1 text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Master Exams with
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                Smart AI Tools
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-300 max-w-md">
              Practice intelligent mock tests, deep analytics, and real-time rankings trusted by 150K+ students.
            </p>

            {/* ========= FEATURE ICONS ========= */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-md">

              <div className="flex items-center space-x-3">
                <Zap className="w-7 h-7 text-cyan-400" />
                <span className="text-gray-300 text-sm sm:text-base">
                  AI Powered
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <BrainCircuit className="w-7 h-7 text-indigo-400" />
                <span className="text-gray-300 text-sm sm:text-base">
                  Smart Analysis
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <BarChart3 className="w-7 h-7 text-emerald-400" />
                <span className="text-gray-300 text-sm sm:text-base">
                  Live Rankings
                </span>
              </div>

            </div>

            {/* ========= STATS ========= */}
            <div className="mt-8 flex space-x-8 text-gray-300">
              <span className="text-sm sm:text-base">
                <span className="text-cyan-400 text-xl font-bold">150K+</span> Students
              </span>
              <span className="text-sm sm:text-base">
                <span className="text-cyan-400 text-xl font-bold">500+</span> Tests
              </span>
            </div>
          </div>

          {/* ================= RIGHT IMAGE ================= */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <img
              src={hero}
              alt="Exam preparation"
              className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl object-contain drop-shadow-2xl scale-[1.25] md:scale-[1.35]"
            />
          </div>

        </div>

        {/* ================= SEARCH BAR BELOW (CENTERED) ================= */}
        <div className="mt-12 sm:mt-14 flex justify-center w-full px-2">
          <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
            <SearchBar value={search} onChange={setSearch} onSubmit={onSubmit} />
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
