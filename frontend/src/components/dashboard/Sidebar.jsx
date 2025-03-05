import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FilePen, 
  Upload, 
  History, 
  Settings, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';

const Sidebar = ({ 
  sidebarOpen, 
  toggleSidebar, 
  darkMode, 
  toggleDarkMode, 
  handleLogout
}) => {
  // Navigation menu items
  const menuItems = [
    { name: 'Dashboard', icon: <FilePen size={20} />, path: '/dashboard' },
    { name: 'Upload', icon: <Upload size={20} />, path: '/dashboard' },
    { name: 'History', icon: <History size={20} />, path: '/history' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen`}>
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className="p-4 flex items-center justify-between">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Legal Simplifier</h1>
            ) : (
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">LS</h1>
            )}
            <button 
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                )}
              </svg>
            </button>
          </div>
          
          <nav className="mt-6">
            <ul className="space-y-2 px-4">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="flex items-center p-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="mr-3">{item.icon}</span>
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        <div className="p-4 mt-auto">
          <div className="flex items-center mb-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {sidebarOpen && (
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;