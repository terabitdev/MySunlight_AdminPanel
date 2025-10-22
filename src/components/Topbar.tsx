import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  Moon, 
  LogOut 
} from 'lucide-react';

interface TopbarProps {
  currentPage?: string;
}

export default function Topbar({ currentPage = 'dashboard' }: TopbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard';
      case 'analytics':
        return 'Analytics';
      case 'users':
        return 'Users';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16  border-b border-gray-400/50 shadow-lg">
      <div className="h-full flex items-center justify-between px-6">
        {/* Page Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-david-libre font-bold text-gray-800">
            {getPageTitle(currentPage)}
          </h1>
        
        </div>

        {/* Right Section - Search, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-48 sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-inter-tight"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

        

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-manrope font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-600 font-inter-tight">admin@mysunlight.com</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter-tight">
                  <User className="h-4 w-4" />
                  Profile Settings
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter-tight">
                  <Settings className="h-4 w-4" />
                  Account Settings
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter-tight">
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </a>
                <hr className="my-2 border-gray-200" />
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-inter-tight">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}