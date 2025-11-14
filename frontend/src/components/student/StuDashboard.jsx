import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  BarChart2,
  Settings,
  LogOut,
  User,
  Clock,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

// --- MOCK DATA ---
// You will replace these with data from your Redux store or API calls.

const mockUser = {
  name: 'Vani',
  email: 'vani@example.com',
  avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=vani`
};

// Represents tests the student is enrolled in
const mockMyTests = [
  {
    _id: '1',
    title: 'SSC CGL Tier 1 Full Mock',
    category: 'SSC',
    questions: 100,
    duration: 60,
    price: 199,
    imageUrl: '/src/assets/ssc.png' // Use assets from your project
  },
  {
    _id: '2',
    title: 'Railway NTPC Stage 2',
    category: 'Railways',
    questions: 120,
    duration: 90,
    price: 0, // Free test
    imageUrl: '/src/assets/rail.png'
  },
  {
    _id: '3',
    title: 'UGC NET Paper 1 Analysis',
    category: 'Teaching',
    questions: 50,
    duration: 60,
    price: 249,
    imageUrl: '/src/assets/ugc.png'
  },
  {
    _id: '4',
    title: 'FCI AG-III Mock Test',
    category: 'FCI',
    questions: 100,
    duration: 60,
    price: 149,
    imageUrl: '/src/assets/fci.png'
  }
];

// Represents past test attempts by the student
const mockAttempts = [
  {
    _id: 'a1',
    testId: '1',
    testName: 'SSC CGL Tier 1 Full Mock',
    date: '2025-11-10T10:30:00Z',
    score: 130,
    totalMarks: 200,
    percentile: 88,
    category: 'SSC'
  },
  {
    _id: 'a2',
    testId: '3',
    testName: 'UGC NET Paper 1 Analysis',
    date: '2025-11-12T14:00:00Z',
    score: 68,
    totalMarks: 100,
    percentile: 75,
    category: 'Teaching'
  },
    {
    _id: 'a3',
    testId: '1',
    testName: 'SSC CGL Tier 1 Full Mock',
    date: '2025-11-14T09:00:00Z',
    score: 142,
    totalMarks: 200,
    percentile: 92,
    category: 'SSC'
  }
];

// --- END MOCK DATA ---

// Helper data for charts
const scoreHistoryData = mockAttempts.map(att => ({
  name: new Date(att.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  score: (att.score / att.totalMarks) * 100
}));

const categoryPerformanceData = [
  { name: 'SSC', value: (136 / 200) * 100 }, // Average of 130 and 142
  { name: 'Teaching', value: (68 / 100) * 100 },
  { name: 'Railways', value: 0 }, // Not attempted
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Main Dashboard Component
export default function StuDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const getAverageScore = () => {
    if (mockAttempts.length === 0) return 'N/A';
    const total = mockAttempts.reduce((acc, att) => acc + (att.score / att.totalMarks) * 100, 0);
    return (total / mockAttempts.length).toFixed(2) + '%';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 mt-10">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600">Student Portal</h2>
        </div>
        <nav className="mt-6">
          <SidebarLink
            icon={<BarChart2 size={20} />}
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <SidebarLink
            icon={<BookOpen size={20} />}
            label="My Mocktests"
            isActive={activeTab === 'my-tests'}
            onClick={() => setActiveTab('my-tests')}
          />
          <SidebarLink
            icon={<TrendingUp size={20} />}
            label="My Performance"
            isActive={activeTab === 'performance'}
            onClick={() => setActiveTab('performance')}
          />
          <SidebarLink
            icon={<DollarSign size={20} />}
            label="Order History"
            isActive={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          />
          <SidebarLink
            icon={<Settings size={20} />}
            label="Profile Settings"
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
          <div className="px-4 mt-10">
             <button className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100">
                <LogOut size={20} className="mr-3" />
                Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {mockUser.name}!
            </h1>
            <p className="text-gray-500">
              Let's get started on your next goal.
            </p>
          </div>
          <div className="flex items-center">
            <img
              src={mockUser.avatar}
              alt="User Avatar"
              className="w-12 h-12 rounded-full border-2 border-blue-500"
            />
          </div>
        </header>

        {/* Tabbed Content */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <DashboardOverview avgScore={getAverageScore()} />
          )}
          {activeTab === 'my-tests' && <MyTests />}
          {activeTab === 'performance' && <PerformanceHistory />}
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'settings' && <ProfileSettings />}
        </div>
      </main>
    </div>
  );
}

// Sidebar Link Component
const SidebarLink = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-6 py-3 text-left ${
      isActive
        ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    } transition-colors duration-150`}
  >
    <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
      {icon}
    </span>
    <span className="ml-4 text-sm font-medium">{label}</span>
  </button>
);

// --- TAB COMPONENTS ---

// 1. Overview Tab
const DashboardOverview = ({ avgScore }) => (
  <div className="grid grid-cols-1 gap-8">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<BookOpen className="text-blue-500" />}
        title="Tests Enrolled"
        value={mockMyTests.length}
        color="blue"
      />
      <StatCard
        icon={<CheckCircle className="text-green-500" />}
        title="Tests Completed"
        value={mockAttempts.length}
        color="green"
      />
      <StatCard
        icon={<TrendingUp className="text-indigo-500" />}
        title="Average Score"
        value={avgScore}
        color="indigo"
      />
    </div>
    
    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Score Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreHistoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0088FE"
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      
      <ChartCard title="Performance by Category">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryPerformanceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {categoryPerformanceData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  </div>
);

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

// 3. Performance History Tab
const PerformanceHistory = () => (
  <ChartCard title="Attempt History">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <Th>Test Name</Th>
            <Th>Date</Th>
            <Th>Score</Th>
            <Th>Percentile</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mockAttempts.map(att => (
            <tr key={att._id} className="hover:bg-gray-50">
              <Td className="font-medium text-gray-900">{att.testName}</Td>
              <Td>{new Date(att.date).toLocaleString()}</Td>
              <Td>
                <span className="font-semibold text-blue-600">
                  {att.score} / {att.totalMarks}
                </span>
              </Td>
              <Td>
                <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  {att.percentile}%
                </span>
              </Td>
              <Td>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Review
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </ChartCard>
);

// 4. Order History Tab (Placeholder)
const OrderHistory = () => (
    <ChartCard title="My Orders">
        <p className="text-gray-600">You have no order history yet.</p>
        {/* You can map over mockOrders here later */}
    </ChartCard>
);

// 5. Profile Settings Tab (Placeholder)
const ProfileSettings = () => (
    <ChartCard title="Profile Settings">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={mockUser.name} className="mt-1 block w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm"/>
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


// --- Reusable UI Components ---

const StatCard = ({ icon, title, value, color }) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-lg border-l-4 border-${color}-500`}
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
    {children}
  </div>
);

const Th = ({ children }) => (
  <th
    scope="col"
    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  >
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 ${className}`}>
    {children}
  </td>
);