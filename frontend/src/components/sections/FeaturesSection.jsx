// src/components/sections/FeaturesSection.jsx
import React from "react";
import { MessageCircle, HelpCircle, BarChart3 } from "lucide-react";

const featuresData = [
  {
    icon: MessageCircle,
    color: "text-cyan-400",
    hoverBorder: "border-cyan-500",
    title: "Instructor Chatboard",
    description:
      "Get your doubts answered instantly through our interactive instructor chatboard designed for fast, accurate responses.",
    value: "Live Doubt Help",
  },
  {
    icon: HelpCircle,
    color: "text-indigo-400",
    hoverBorder: "border-indigo-500",
    title: "Doubt Solving System",
    description:
      "Submit tricky questions and receive step-by-step solutions from verified educators with clear explanations.",
    value: "Quick Solutions",
  },
  {
    icon: BarChart3,
    color: "text-emerald-400",
    hoverBorder: "border-emerald-500",
    title: "Performance Analytics",
    description:
      "Track your accuracy, speed, strong & weak chapters with a clean analytics dashboard that helps you improve faster.",
    value: "Deep Insights",
  },
];

const FeaturesSection = () => (
  <section className="py-8 md:py-8 bg-gray-950 relative overflow-hidden text-gray-100">
    
    {/* Glow */}
    <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400 mb-2">
          Why Students Trust Us
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Learn Smarter. <span className="text-cyan-400">Improve Faster.</span>
        </h2>

        <p className="mt-3 text-lg md:text-xl text-gray-400 max-w-xl mx-auto">
          Tools built to clear doubts quickly, improve weak areas, and help you score better with structured feedback.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
        {featuresData.map((feature, index) => (
          <div
            key={index}
            className={`
              group p-6 md:p-8 pt-10
              bg-gray-900/70 backdrop-blur-sm
              rounded-2xl shadow-2xl shadow-black/50
              border border-gray-800 hover:${feature.hoverBorder}
              transition-all duration-500 hover:scale-[1.03]
              relative overflow-hidden
            `}
          >
            <div className="relative z-10">
              <feature.icon
                className={`w-10 h-10 md:w-12 md:h-12 ${feature.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-500`}
              />

              <p className="text-xl md:text-2xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300">
                {feature.value}
              </p>

              <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
                {feature.title}
              </h3>

              <p className="text-base text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Hover glow */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl ${feature.color.replace(
                "text-",
                "bg-"
              )}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
