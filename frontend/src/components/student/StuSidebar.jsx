import React from 'react';
import {
  BookOpen,
  TrendingUp,
  BarChart2,
  Settings,
  LogOut,
  DollarSign
} from 'lucide-react';
import SidebarLink from './ui/SidebarLink';

const StuSidebar = ({ activeTab, setActiveTab }) => {
  // You can later get this logout function from Redux/Auth context
  const handleLogout = () => {
    console.log("Logout clicked");
    // dispatch(logoutUser());
  };

  return (
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
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
        </div>
      </nav>
    </aside>
  );
};

export default StuSidebar;