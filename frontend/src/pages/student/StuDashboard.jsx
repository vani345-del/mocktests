// frontend/src/pages/student/StuDashboard.jsx
import React, { useState } from "react";

import StuSidebar from "../../components/student/StuSidebar";
import StuHeader from "../../components/student/StuHeader";

import DashboardOverview from "./DashboardOverview";
import ExploreTests from "./ExploreTests";
import PerformanceHistory from "./PerformanceHistory";
import ProfileSettings from "./ProfileSettings";
import { mockUser } from "../../components/student/mockData";
import MyTests from "./MyTests";

export default function StuDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <StuSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT */}
      <main
        className="
          pt-20 md:pt-4
          md:ml-64       /* SPACE FOR FIXED SIDEBAR */
          p-4 sm:p-6 lg:p-8
          overflow-y-auto
          min-h-screen
        "
      >
        {/* Header */}
        <StuHeader user={mockUser} />

        {/* Pages */}
        <div className="mt-6">
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "my-tests" && <MyTests />}
          {activeTab === "explore" && <ExploreTests />}
          {activeTab === "performance" && <PerformanceHistory />}
          {activeTab === "settings" && <ProfileSettings />}
        </div>
      </main>
    </div>
  );
}
