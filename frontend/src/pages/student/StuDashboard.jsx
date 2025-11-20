import React, { useState } from 'react';

// Layout Components
import StuSidebar from "../../components/student/StuSidebar";;
import StuHeader from "../../components/student/StuHeader";

// Page Components
import DashboardOverview from './DashboardOverview';

import PerformanceHistory from './PerformanceHistory';
import OrderHistory from './OrderHistory';
import ProfileSettings from './ProfileSettings';

// Data
import { mockUser } from '../../components/student/mockData';
import MyTests from './MyTests';

// Main Dashboard Component
export default function StuDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex min-h-screen bg-gray-50 mt-10">
      {/* Sidebar Navigation */}
      <StuSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <StuHeader user={mockUser} />

        {/* Tabbed Content */}
        <div className="mt-4">
          {activeTab === 'overview' && <DashboardOverview />}
          {activeTab === 'my-tests' && <MyTests/>}
          {activeTab === 'performance' && <PerformanceHistory />}
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'settings' && <ProfileSettings />}
        </div>
      </main>
    </div>
  );
}