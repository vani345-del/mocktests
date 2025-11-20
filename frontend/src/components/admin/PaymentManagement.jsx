import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import {
  FaMagnifyingGlass, 
  FaDownload,
  FaCircleCheck, 
  FaCircleXmark, 
  FaClock,
  FaMoneyBillWave,
  FaCalendar,
  FaArrowTrendUp, 
  FaHandshake, 	
} from "react-icons/fa6"; 

// Helper function to format INR currency
const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

// Helper function to render status badges
const StatusBadge = ({ status }) => {
  const baseClass = "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200";
  
  switch (status?.toLowerCase()) {
    case "success":
      return (
        <span className={`${baseClass} bg-green-100 text-green-700`}>
          <FaCircleCheck className="w-3 h-3" /> Success
        </span>
      );
    case "failed":
      return (
        <span className={`${baseClass} bg-red-100 text-red-700`}>
          <FaCircleXmark className="w-3 h-3" /> Failed
        </span>
      );
    case "pending":
    default:
      return (
        <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>
          <FaClock className="w-3 h-3" /> Pending
        </span>
      );
  }
};


const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // Removed methodFilter state (not used in final table design)
  const [dateFilter, setDateFilter] = useState("");

  // KPI DATA
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todaysRevenue: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    totalPending: 0,
  });

  /* ---------------------- FETCH DATA & CALCULATE KPIs ---------------------- */

  useEffect(() => {
    setLoading(true);
    fetchPayments();
    fetchCourses();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get("/api/admin/payments"); 
      setPayments(data);

      // --- KPI CALCULATIONS ---
      const successPayments = data.filter((p) => p.status === "success");
      const pendingPayments = data.filter((p) => p.status === "pending");
      const totalCount = data.length;

      const totalRevenue = successPayments.reduce((sum, p) => sum + p.amount, 0);

      const today = new Date().toLocaleDateString();
      const todaysRevenue = successPayments
        .filter((p) => new Date(p.date).toLocaleDateString() === today)
        .reduce((sum, p) => sum + p.amount, 0);
        
      const aov = successPayments.length > 0 
                ? Math.round(totalRevenue / successPayments.length) 
                : 0;

      setStats({
        totalRevenue: totalRevenue,
        todaysRevenue: todaysRevenue,
        totalTransactions: totalCount,
        averageOrderValue: aov,
        totalPending: pendingPayments.length,
      });
      
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH COURSES / MOCKTESTS for filter dropdown
  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/api/public/mocktests/published/list"); 
      setCourses(data); 
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  /* ---------------------- FILTER LOGIC (Memoized) ---------------------- */
  
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.orderId?.toLowerCase().includes(search.toLowerCase());

      const matchesCourse =
        courseFilter === "" || p.courseName === courseFilter;

      const matchesStatus =
        statusFilter === "" || p.status === statusFilter;

      // Removed matchesMethod logic for cleaner component

      const matchesDate =
        dateFilter === "" ||
        new Date(p.date).toISOString().split('T')[0] === dateFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [payments, search, courseFilter, statusFilter, dateFilter]);


  /* ---------------------- RENDER ---------------------- */

  // Custom Tailwind classes for better reusability
  const tableHeadClassLeft = "px-6 py-3 text-left font-bold text-gray-600 tracking-wider border-b";
  const tableDataClass = "px-6 py-4 whitespace-nowrap text-gray-700";
  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 outline-none";
  
  const KpiCard = ({ title, value, icon: Icon, colorClass }) => {
    const isColoredBg = colorClass.includes('bg-indigo') || colorClass.includes('bg-orange');
    const textColor = isColoredBg ? 'text-white' : 'text-gray-900';
    const iconColor = isColoredBg ? 'text-white' : 'text-gray-500';
    
    return (
      <div className={`flex flex-col p-5 rounded-xl shadow-lg border-b-4 ${colorClass}`}>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h2 className={`text-2xl font-extrabold mt-3 ${textColor}`}>
          {value}
        </h2>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        💳 Payment Management
      </h1>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">

        {/* Total Revenue */}
        <KpiCard 
          title="Total Revenue" 
          value={formatPrice(stats.totalRevenue)} 
          icon={FaMoneyBillWave} 
          colorClass="bg-white border-l-4 border-indigo-600 shadow-lg" 
        />

        {/* Today's Revenue */}
        <KpiCard 
          title="Today's Revenue" 
          value={formatPrice(stats.todaysRevenue)} 
          icon={FaCalendar} 
          colorClass="bg-white border-l-4 border-orange-500 shadow-lg" 
        />

        {/* Total Transactions */}
        <KpiCard 
          title="Total Transactions" 
          value={stats.totalTransactions} 
          icon={FaArrowTrendUp} 
          colorClass="bg-white border-l-4 border-blue-500 shadow-lg" 
        />

        {/* Average Order Value (AOV) */}
        <KpiCard 
          title="Avg. Order Value (AOV)" 
          value={formatPrice(stats.averageOrderValue)} 
          icon={FaHandshake} 
          colorClass="bg-white border-l-4 border-green-500 shadow-lg" 
        />

        {/* Pending Payments */}
        <KpiCard 
          title="Pending Payments" 
          value={stats.totalPending} 
          icon={FaClock} 
          colorClass="bg-white border-l-4 border-red-500 shadow-lg" 
        />

      </div>
      
      {/* --- FILTER & ACTIONS BAR --- */}
      <div className="bg-white rounded-xl shadow p-5 mb-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Filter Transactions</h3>
            <button
                className="flex items-center bg-blue-500 text-white px-4 py-2.5 rounded-lg shadow hover:bg-blue-600 transition"
                onClick={() => alert("Downloading report...")}
            >
                <FaDownload className="w-4 h-4 mr-2" /> Download Report ({filteredPayments.length})
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="col-span-1 md:col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-1">Search (Name, Email, Order ID)</label>
            <div className="flex items-center bg-gray-50 rounded-lg border focus-within:border-blue-500 transition duration-150">
              <FaMagnifyingGlass className="text-gray-400 w-4 h-4 ml-3" /> 
              <input
                type="text"
                placeholder="Search..."
                className="p-2.5 bg-transparent outline-none w-full text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Test Name Filter */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Test Name</label>
            <select
              className={inputClass}
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="">All Tests</option>
              {courses.map((c) => (
                // Assuming 'title' is used for display and filtering on the frontend
                <option key={c._id} value={c.title}>
                  {c.title} 
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
            <select
              className={inputClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="success">✅ Success</option>
              <option value="failed">❌ Failed</option>
              <option value="pending">⏳ Pending</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Purchase Date</label>
            <input
              type="date"
              className={inputClass}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* --- PAYMENT TABLE --- */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
            <p className="text-sm text-gray-500">{filteredPayments.length} records shown</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100/70">
                
                {/* 1. Name */}
                <th className={tableHeadClassLeft}>Name</th> 

                {/* 2. Test Name (Course Name) */}
                <th className={tableHeadClassLeft}>Test Name</th> 
                
                {/* 3. Email */}
                <th className={tableHeadClassLeft}>Email</th>
                
                {/* 4. Paid Amount (Right Aligned) */}
                <th className="px-6 py-3 text-right font-bold text-gray-600 tracking-wider border-b">Paid Amount</th>
                
                {/* 5. Purchased Date */}
                <th className={tableHeadClassLeft}>Purchased Date</th> 
                
                {/* 6. Status - ADDED MISSING HEADER */}
                <th className={tableHeadClassLeft}>Status</th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-lg text-gray-500">
                    <FaClock className="animate-spin inline mr-2" /> Loading transactions...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-lg text-gray-500">
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr className="hover:bg-blue-50/30 transition duration-150" key={p._id}>
                    
                    {/* Name */}
                    <td className={tableDataClass}>
                      <p className="font-semibold text-gray-900">{p.studentName}</p>
                    </td>
                    
                    {/* Test Name */}
                    <td className={tableDataClass}>{p.courseName}</td>
                    
                    {/* Email */}
                    <td className={`${tableDataClass} text-xs text-gray-500`}>{p.email}</td>

                    {/* Paid Amount */}
                    <td className={`${tableDataClass} font-extrabold text-right text-green-600`}>
                      {formatPrice(p.amount)}
                    </td>

                    {/* Purchased Date */}
                    <td className={tableDataClass}>
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    
                    {/* Status - ADDED MISSING BODY CONTENT */}
                    <td className={tableDataClass}>
                      <StatusBadge status={p.status} />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default PaymentManagement;