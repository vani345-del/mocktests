// frontend/src/components/admin/DashboardPage.jsx
// (This is your modified file)

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaClipboardList,
  FaDollarSign,
} from "react-icons/fa";
import { fetchAdminStats } from "../../redux/dashboardSlice";
import StatCard from "./StatCard";
import { ClipLoader } from "react-spinners"; 

import CategorySalesChart from "./CategorySalesChart";
import TestTypeBreakdown from "./TestTypeBreakdown";// A loading spinner

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    // Fetch stats when the component mounts
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={50} color={"#123abc"} loading={loading} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
        Error fetching stats: {error}
      </div>
    );
  }

  // Format revenue as currency
  const formattedRevenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(stats.revenue);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Welcome! Here's a high-level overview of your platform's activity.
      </p>

      {/* Stats Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={formattedRevenue}
          icon={<FaDollarSign />}
          bgColor="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={<FaClipboardList />}
          bgColor="bg-blue-500"
        />
        <StatCard
          title="Total Students"
          value={stats.students}
          icon={<FaUserGraduate />}
          bgColor="bg-yellow-500"
        />
        <StatCard
          title="Total Instructors"
          value={stats.instructors}
          icon={<FaChalkboardTeacher />}
          bgColor="bg-purple-500"
        />
        <StatCard
          title="Total Mock Tests"
          value={stats.mockTests}
          icon={<FaBook />}
          bgColor="bg-indigo-500"
        />
        <StatCard
          title="Total Test Attempts"
          value={stats.attempts}
          icon={<FaUsers />}
          bgColor="bg-pink-500"
        />
      </div>



      {/* You can add more components here later, like recent orders or new users charts 
      */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <CategorySalesChart data={stats.categorySales} />
        <TestTypeBreakdown data={stats.testTypeSales} />
      </div>
    </div>
  );
};

export default DashboardPage;