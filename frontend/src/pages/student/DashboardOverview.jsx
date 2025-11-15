// frontend/src/pages/student/DashboardOverview.jsx
import React from 'react';
import { useSelector } from 'react-redux'; // --- 1. IMPORT useSelector ---
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
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
} from 'recharts';
  
// --- 2. We can remove mockData imports ---
// import { 
//   mockMyTests, 
//   mockAttempts, 
//   scoreHistoryData, 
//   categoryPerformanceData, 
//   COLORS, 
//   getAverageScore 
// } from "../../components/student/mockData"

import { StatCard, ChartCard } from '../../components/student/DashboardUIKIt';
// --- 3. IMPORT NEW LEADERBOARD COMPONENT ---
import GrandTestLeaderboard from '../../components/student/GrandTestLeaderboard';


// --- Dummy data just for charts, as this logic is complex ---
// You can replace this later by building real chart data from attempts
const scoreHistoryData = [
  { name: 'Test 1', score: 65 },
  { name: 'Test 2', score: 75 },
  { name: 'Test 3', score: 70 },
  { name: 'Test 4', score: 80 },
];
const categoryPerformanceData = [
  { name: 'Subject A', value: 400 },
  { name: 'Subject B', value: 300 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// --- End of dummy chart data ---


// 1. Overview Tab
const DashboardOverview = () => {
  
  // --- 4. GET REAL DATA FROM REDUX ---
  const { userData } = useSelector((state) => state.user);
  
  const myTests = userData?.purchasedTests || [];
  const myAttempts = userData?.attempts || [];
  
  const avgScore = myAttempts.length > 0
    ? (myAttempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0) / myAttempts.length).toFixed(0)
    : 0;
    
  const now = new Date().getTime();
  
  // Filter for Grand Tests that are over
  const completedGrandTests = myTests.filter(test =>
    test.isGrandTest && (new Date(test.scheduledFor).getTime() + test.durationMinutes * 60000) < now
  );
  // --- 👆 END OF REAL DATA LOGIC ---

  return (
    <div className="grid grid-cols-1 gap-8">
      
      {/* --- 5. LEADERBOARD SECTION --- */}
      {completedGrandTests.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Grand Test Leaderboards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGrandTests.map(test => (
              <GrandTestLeaderboard 
                key={test._id} 
                mockTestId={test._id} 
                title={test.title} 
              />
            ))}
          </div>
        </section>
      )}
      {/* --- 👆 END OF LEADERBOARD SECTION --- */}
    
      {/* Stats Cards - NOW USING REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<BookOpen className="text-blue-500" />}
          title="Tests Enrolled"
          value={myTests.length} // Real data
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="text-green-500" />}
          title="Tests Completed"
          value={myAttempts.length} // Real data
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="text-indigo-500" />}
          title="Average Score"
          value={avgScore} // Real data
          color="indigo"
        />
      </div>
      
      {/* Charts Section (Still using dummy data) */}
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
};

export default DashboardOverview;