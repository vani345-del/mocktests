// src/components/sections/CategoriesSection.jsx
import React from "react";
import { Loader2 } from "lucide-react";

// Clean image URL builder
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  let cleaned = imagePath.trim();
  if (!cleaned.startsWith("/")) cleaned = "/" + cleaned;
  return `http://localhost:8000${cleaned}`;
};

const CategoriesSection = ({ categories = [], loading, onCategoryClick }) => {
  return (
    <section className="py-20 md:py-28 bg-gray-950 relative overflow-hidden">

      {/* Background Noise */}
      <div className="absolute inset-0 opacity-10 bg-[url('/noise.svg')] bg-repeat [background-size:120px_120px]"></div>

      {/* Soft glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* SECTION HEADER */}
        <div className="text-center mb-16">
          <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">
            Categories
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
            Explore <span className="text-cyan-400">Learning Domains</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
            Choose a category to discover specialized test series, mock exams,
            and detailed learning modules built for your success.
          </p>
        </div>

        {/* LOADING SKELETON GRID */}
        {loading && (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center animate-pulse"
              >
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ))}
          </div>
        )}

        {/* FINAL PREMIUM GRID */}
        {!loading && (
          <div
            className="
              grid 
              gap-6 
              grid-cols-2 
              sm:grid-cols-3 
              md:grid-cols-4 
              xl:grid-cols-6
              auto-rows-[1fr]
            "
          >
            {categories.map((cat, index) => {
              const imgUrl = getImageUrl(cat.image);

              return (
                <div
                  key={cat._id}
                  onClick={() => onCategoryClick(cat)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="
                    group relative cursor-pointer rounded-2xl overflow-hidden
                    bg-gray-900/40 backdrop-blur-lg shadow-lg shadow-black/40 
                    border border-gray-800
                    hover:border-cyan-500 hover:shadow-cyan-500/20
                    transition-all duration-500 transform hover:-translate-y-2
                    animate-fade-up
                    flex flex-col
                  "
                >
                  {/* BG Hover Tint */}
                  <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition duration-500"></div>

                  {/* IMAGE */}
                  <div className="flex items-center justify-center bg-gray-800 p-3 h-32 sm:h-36 md:h-40">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={cat.name}
                        className="
                          w-full h-full object-contain
                          group-hover:scale-110 transition duration-500
                        "
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">No Image</span>
                    )}
                  </div>

                  {/* TEXT */}
                  <div className="p-4 text-center flex flex-col flex-grow">
                    <h3
                      className="
                        text-white text-lg font-extrabold tracking-wide 
                        group-hover:text-cyan-400 transition
                        drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]
                      "
                    >
                      {cat.name}
                    </h3>

                    <p className="text-cyan-300 text-sm font-semibold mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {cat.totalTests ? `${cat.totalTests} Tests` : "Available Tests"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default CategoriesSection;
