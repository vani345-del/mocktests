import React from 'react';
import { mockUser } from '../mockData';
import { ChartCard } from '../ui/DashboardUI';

// 5. Profile Settings Tab (Placeholder)
const ProfileSettings = () => (
    <ChartCard title="Profile Settings">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" defaultValue={mockUser.name} className="mt-1 block w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" value={mockUser.email} disabled className="mt-1 block w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
            </div>
            <div>
                <button className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Update Profile
                </button>
            </div>
        </div>
    </ChartCard>
);

export default ProfileSettings;