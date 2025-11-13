// src/components/MockTestCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook } from 'react-icons/fa'; // Icon for subjects

export default function MockTestCard({ test }) {
  // Use a placeholder image if no image is provided
  const imageUrl = test.imageUrl || null; // Handle null case

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      
      {/* Image Placeholder */}
      <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400">
        {imageUrl ? (
           <img src={imageUrl} alt={test.title} className="w-full h-full object-cover" />
        ) : (
          <span>No Image</span>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2" title={test.title}>
          {test.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-slate-600 mt-2 flex-grow line-clamp-3 leading-relaxed">
          {test.shortDescription || test.description?.slice(0, 100) + (test.description?.length > 100 ? '...' : '')}
        </p>
        
        {/* Subjects (Metadata) */}
        <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
          <FaBook className="text-slate-400" />
          <span>{test.subjects?.join(', ') || 'General'}</span>
        </div>

        {/* Footer: Price & Button */}
        <div className="flex items-center justify-between mt-5">
          {/* Price */}
          <div>
            {test.price > 0 ? (
              <span className="text-xl font-bold text-gray-800">₹{test.price}</span>
            ) : (
              <span className="text-xl font-bold text-green-600">Free</span>
            )}
          </div>
          
          {/* View Button */}
          <Link 
            to={`/mocktest/${test._id}`} 
            className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}