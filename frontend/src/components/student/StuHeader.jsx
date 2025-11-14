import React from 'react';

const StuHeader = ({ user }) => {
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-500">
          Let's get started on your next goal.
        </p>
      </div>
      <div className="flex items-center">
        <img
          src={user.avatar}
          alt="User Avatar"
          className="w-12 h-12 rounded-full border-2 border-blue-500"
        />
      </div>
    </header>
  );
};

export default StuHeader;