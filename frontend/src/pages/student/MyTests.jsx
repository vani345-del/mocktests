import React from 'react';
import { Clock, HelpCircle } from 'lucide-react';
import { mockMyTests } from '../mockData';

// 2. My Tests Tab
const MyTests = () => (
  <div>
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Mocktests</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockMyTests.map(test => (
        <div
          key={test._id}
          className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1"
        >
          <img
            src={test.imageUrl || `https://via.placeholder.com/400x200?text=${test.category}`}
            alt={test.title}
            className="h-48 w-full object-cover"
          />
          <div className="p-6">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
              {test.category}
            </span>
            <h3 className="mt-3 font-semibold text-xl text-gray-900 truncate">
              {test.title}
            </h3>
            <div className="flex justify-between items-center text-gray-600 text-sm mt-3">
              <span className="flex items-center">
                <HelpCircle size={16} className="mr-1.5" />
                {test.questions} Questions
              </span>
              <span className="flex items-center">
                <Clock size={16} className="mr-1.5" />
                {test.duration} Mins
              </span>
            </div>
            <button className="mt-5 w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Test
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MyTests;