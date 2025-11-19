import React, { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaUsersCog,
  FaChartBar,
  FaFileAlt,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaMoneyBillAlt,
  FaSignOutAlt,
  FaBars, // Added FaBars for mobile toggle
} from "react-icons/fa";

// ----------------------------------------------
// NAV ITEMS (No change)
// ----------------------------------------------
const navItems = [
  { name: "Dashboard", path: "/admin", icon: FaHome },

  {
    name: "Tests",
    key: "tests",
    icon: FaFileAlt,
    children: [
      { name: "Manage Tests", path: "/admin/tests/manage-tests", icon: FaChartBar },
      { name: "Add New Test", path: "/admin/tests/add-new-test", icon: FaPlus },
      
    ],
  },

  {
    name: "Users",
    key: "users",
    icon: FaUsers,
    children: [
      {
        name: "Instructors",
        key: "instructors",
        icon: FaUsersCog,
        children: [
          {
            name: "Manage Instructors",
            path: "/admin/users/instructors/manage",
            icon: FaUsersCog,
          },
          { name: "Add Instructor", path: "/admin/users/instructors/add", icon: FaPlus },
        ],
      },
      {
        name: "Students",
        key: "students",
        icon: FaUsers,
        children: [
          {
            name: "Manage Students",
            path: "/admin/users/students/manage",
            icon: FaUsers,
          },
          { name: "Add Student", path: "/admin/users/students/add", icon: FaPlus },
        ],
      },
    ],
  },

  { name: "Payment Management", path: "/admin/payments", icon: FaMoneyBillAlt },
];

// ----------------------------------------------
// SINGLE MENU ITEM (No change)
// ----------------------------------------------
const MenuItem = ({ item, depth = 0, isOpen, toggleOpen, openSections }) => {
  const location = useLocation();

  const isActive = useMemo(() => {
    if (item.path) return location.pathname === item.path;
    return item.children?.some(c => location.pathname.startsWith(c.path));
  }, [location.pathname]);

  const activeClass = `
    bg-blue-600 text-white shadow-md shadow-blue-600/30
    border-l-4 border-blue-400
  `;

  const normalClass = `
    text-gray-400 hover:text-white hover:bg-gray-800
  `;

  const baseClass = `
    flex items-center justify-between gap-3 px-4 py-3
    rounded-lg transition-all duration-200 ease-in-out
    cursor-pointer
  `;

  // Leaf Link
  if (item.path) {
    return (
      <li>
        <NavLink
          to={item.path}
          className={({ isActive: exact }) =>
            `${baseClass} ${exact ? activeClass : normalClass}`
          }
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </div>
        </NavLink>
      </li>
    );
  }

  // Parent With Children
  const parentActiveClass = isActive ? 'text-white bg-gray-800' : normalClass;
  const chevronColor = isActive ? 'text-blue-400' : 'text-gray-400';

  return (
    <li>
      <div
        className={`${baseClass} ${parentActiveClass}`}
        onClick={() => toggleOpen(item.key)}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span>{item.name}</span>
        </div>

        <span className="ml-auto">
          {isOpen ? (
            <FaChevronUp className={`text-xs ${chevronColor}`} />
          ) : (
            <FaChevronDown className={`text-xs ${chevronColor}`} />
          )}
        </span>
      </div>

      {/* Children list - conditional rendering based on isOpen */}
      {isOpen && (
        <ul className="ml-2 mt-2 space-y-2 border-l border-gray-700/50 pl-4">
          {item.children.map(child => (
            <MenuItem
              key={child.name}
              item={child}
              depth={depth + 1}
              // Only pass open state down if the child is also a parent
              isOpen={child.children ? openSections[child.key] : false}
              toggleOpen={toggleOpen}
              openSections={openSections}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// ----------------------------------------------
// SIDEBAR
// ----------------------------------------------
const Sidebar = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});
  const [collapsed, setCollapsed] = useState(true); // Manages mobile open/close state

  // Function to initialize openSections state based on the current URL path (No change)
  const initializeOpenSections = () => {
    const newOpenSections = {};
    const path = location.pathname;
    
    // A simplified, less recursive approach for the existing 3-level structure:
    navItems.forEach(level1 => {
        if (level1.children) {
            let isLevel1Open = false;
            level1.children.forEach(level2 => {
                if (level2.path && path.startsWith(level2.path)) {
                    isLevel1Open = true; 
                } else if (level2.children) {
                    let isLevel2Open = false;
                    level2.children.forEach(level3 => {
                        if (level3.path && path.startsWith(level3.path)) {
                            isLevel2Open = true;
                            isLevel1Open = true; 
                        }
                    });
                    if (isLevel2Open) {
                        newOpenSections[level2.key] = true;
                    }
                }
            });
            if (isLevel1Open) {
                newOpenSections[level1.key] = true;
            }
        }
    });

    setOpenSections(newOpenSections);
  };

  useEffect(() => {
    initializeOpenSections();
  }, [location.pathname]); // Re-run when URL changes

  const toggleOpen = key =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  
  // Custom CSS to hide the scrollbar for the nav element (No change)
  const scrollbarHideStyle = `
    .scrollbar-hidden::-webkit-scrollbar {
      display: none; /* Safari and Chrome */
    }
    .scrollbar-hidden {
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
    }
  `;

  return (
    <>
      <style>{scrollbarHideStyle}</style>

      {/* MOBILE OVERLAY TOGGLE BAR - Added a fixed bar for mobile */}
      <div 
        className="md:hidden fixed top-0 left-0 w-full p-4 bg-gray-900/95 backdrop-blur-md z-50 flex justify-between items-center"
      >
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <FaBars 
          className="text-white text-2xl cursor-pointer" 
          onClick={() => setCollapsed(!collapsed)} 
        />
      </div>

      {/* Sidebar - Made changes to fix it on desktop */}
      <aside
        className={`
          bg-gray-900/95 backdrop-blur-lg shadow-2xl shadow-gray-900/50
          fixed top-0 left-0 h-screen w-64 // **Fixed and full height**
          transition-transform duration-300 ease-in-out
          ${collapsed ? "transform -translate-x-full md:translate-x-0" : "transform translate-x-0"}
          flex flex-col z-40
        `}
      >
        {/* Profile section */}
        <div className="flex flex-col items-center py-6 border-b border-gray-800 mt-14 md:mt-0"> {/* Adjusted top margin for mobile fixed bar */}
          <img
            src="https://placehold.co/150x150/1C3C6B/ffffff?text=VK"
 
            className="w-16 h-16 rounded-full border-2 border-blue-600 shadow-xl"
            alt="User Avatar"
          />
          <h4 className="text-white font-semibold mt-3 text-lg tracking-wide">Vani Kapoor</h4>
          <p className="text-blue-400 text-sm font-medium">System Admin</p>
        </div>

        {/* Navigation - Uses flex-grow and overflow-y-auto to scroll internally */}
        <nav className="flex-grow overflow-y-auto px-4 py-6 scrollbar-hidden">
          <ul className="space-y-1">
            {navItems.map(item => (
              <MenuItem
                key={item.name}
                item={item}
                depth={0}
                isOpen={openSections[item.key]}
                toggleOpen={toggleOpen}
                openSections={openSections}
              />
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800 mt-auto">
          <button 
            className="w-full bg-red-700/30 hover:bg-red-700/50 text-red-300 py-3 
                       rounded-lg flex items-center gap-3 justify-center font-medium 
                       transition duration-200"
            onClick={() => console.log('Logging out...')}
          >
            <FaSignOutAlt className="w-4 h-4" /> 
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;