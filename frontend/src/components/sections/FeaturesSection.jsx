// src/components/sections/FeaturesSection.jsx
import React from "react";
import { IconBookOpen, IconTarget, IconUsers } from "../../icons/Icons";

const FeaturesSection = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="text-center p-6">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
          <IconBookOpen />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Expert-Made Tests</h3>
        <p className="mt-2 text-base text-gray-600">
          Questions curated by subject matter experts to match the latest exam
          patterns.
        </p>
      </div>

      <div className="text-center p-6">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
          <IconTarget />
        </div>
        <h3 className="text-lg font-bold text-gray-900">All-India Ranking</h3>
        <p className="mt-2 text-base text-gray-600">
          See where you stand against thousands of aspirants in our Grand Tests.
        </p>
      </div>

      <div className="text-center p-6">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
          <IconUsers />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Instructor Support</h3>
        <p className="mt-2 text-base text-gray-600">
          Get your doubts cleared by experienced instructors with our new chat
          feature.
        </p>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
