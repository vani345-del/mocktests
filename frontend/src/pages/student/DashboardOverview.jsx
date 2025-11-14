import React from 'react';
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
import { 
  mockMyTests, 
  mockAttempts, 
  scoreHistoryData, 
  categoryPerformanceData, 
  COLORS, 
  getAverageScore 
} from "../../components/student/mockData"
import { StatCard, ChartCard } from '../../components/student/DashboardUIKIt';

// 1. Overview Tab
const DashboardOverview = () => {
  const avgScore = getAverageScore();

  return (
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
};

export default DashboardOverview;