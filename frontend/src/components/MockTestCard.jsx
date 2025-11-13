// src/components/MockTestCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function MockTestCard({ test }) {
  return (
    <div className="border rounded p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{test.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{test.shortDescription || test.description?.slice(0, 120)}</p>
      <div className="flex items-center justify-between mt-3">
        <div>
          <span className="text-xl font-bold">₹{test.price ?? 'Free'}</span>
          <div className="text-xs text-gray-500">Subjects: {test.subjects?.join(', ') || 'General'}</div>
        </div>
        <Link to={`/mocktest/${test._id}`} className="px-3 py-1 bg-slate-700 text-white rounded text-sm">View</Link>
      </div>
    </div>
  );
}
