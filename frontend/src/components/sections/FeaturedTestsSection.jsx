// src/components/sections/FeaturedTestsSection.jsx
import React from "react";
import { Clock, BookOpen, Users, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const TestCard = ({ test }) => {
  const isGrand = test.type === "Grand";

  const accentColor = isGrand
    ? "from-indigo-500 to-purple-400"
    : "from-cyan-500 to-teal-400";

  const accentLight = isGrand ? "text-indigo-400" : "text-cyan-400";
  const glowColor = isGrand ? "shadow-indigo-500/50" : "shadow-cyan-500/50";

  const students = (test.questions * 37) + 500;

  return (
    <div
      className={`
        group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer
        bg-gray-900/80 backdrop-blur-md
        border border-gray-800 
        shadow-2xl hover:${glowColor}
        transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.03]
        before:content-[''] before:absolute before:inset-0 before:rounded-2xl 
        before:border-2 before:opacity-0 group-hover:opacity-100 
        before:transition-opacity before:duration-500 before:border-transparent 
        before:bg-clip-border before:bg-gradient-to-r before:${accentColor}
      `}
    >
      <div
        className={`
          w-full py-2.5 px-5 text-sm font-extrabold text-white relative
          bg-gradient-to-r ${accentColor}
          shadow-lg shadow-black/30
        `}
      >
        <span className="relative z-10 tracking-widest uppercase">
          {isGrand ? "All-India Grand Test" : "Premium Mock Test"}
        </span>
        <Rocket className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 transition-transform group-hover:rotate-12" />
      </div>

      <Link to={`/mocktests/${test._id}`} className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          {test.category?.name && (
            <p className="text-sm font-semibold text-gray-400 mb-1 tracking-wider">
              {test.category.name.toUpperCase()}
            </p>
          )}
          <h3 className="text-2xl font-bold text-white leading-snug line-clamp-2">
            {test.title}
          </h3>
        </div>

        <p className="text-gray-400 text-sm mb-5 line-clamp-3 flex-grow">
          {test.description}
        </p>

        <div className="grid grid-cols-3 gap-4 border-y border-gray-700/50 py-4 mb-5">
          <div className="text-center">
            <Clock className={`w-5 h-5 ${accentLight} mx-auto mb-1`} />
            <p className="text-xl font-extrabold text-white">{test.duration}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Min</p>
          </div>

          <div className="text-center">
            <BookOpen className={`w-5 h-5 ${accentLight} mx-auto mb-1`} />
            <p className="text-xl font-extrabold text-white">{test.questions}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Qs</p>
          </div>

          <div className="text-center">
            <Users className={`w-5 h-5 ${accentLight} mx-auto mb-1`} />
            <p className="text-xl font-extrabold text-white">
              {students.toLocaleString().replace(/,/g, " ")}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Enrolled</p>
          </div>
        </div>

        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 drop-shadow-lg">
          ₹{test.price}
        </p>
      </Link>
    </div>
  );
};

const FeaturedTestsSection = ({ id, title, tests, loading, showViewAll, onViewAll }) => {
  const darkBg = id === "grand-tests";

  return (
    <section className={`py-20 md:py-28 ${darkBg ? "bg-gray-900" : "bg-gray-950"} text-gray-100 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://api.netlify.com/builds/grid.svg')]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-md font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            Top Rated Series
          </p>
          <h2 className="text-center text-4xl md:text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
              {title}
            </span>
          </h2>
        </div>

        {loading && (
          <p className="text-center text-cyan-400 animate-pulse text-lg">Loading...</p>
        )}

        {!loading && tests.length === 0 && (
          <p className="text-center text-gray-500 text-lg">No tests found.</p>
        )}

        <div className="grid gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {!loading && tests.map((test) => <TestCard key={test._id} test={test} />)}
        </div>

        {showViewAll && (
          <div className="text-center mt-16">
            <button
              onClick={onViewAll}
              className="px-10 py-3 font-extrabold text-gray-900 bg-cyan-400 rounded-full shadow-2xl shadow-cyan-500/50 hover:bg-cyan-300 transform hover:scale-[1.05]"
            >
              View All Tests
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTestsSection;
