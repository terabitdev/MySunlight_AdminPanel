import { useState } from 'react';
import {
  Search,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import ProfileSettingsModal from './modal/ProfileSettingsModal';
import { useSearch } from '../context/SearchContext';

export default function Topbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { searchQuery, setSearchQuery, currentPage } = useSearch();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // The app will automatically redirect to SignIn page due to auth state listener in App.tsx
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-20  border-b border-gray-400/50 shadow-lg">
      <div className="h-full flex items-center justify-between px-6">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={currentPage === 'users' ? 'Search users...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-48 sm:w-64 border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-inter-tight"
            />
          </div>
        </div>

        {/* Right Section - Notifications, Profile */}
        <div className="flex items-center gap-4">
        

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="Profile menu"
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
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter-tight transition-colors duration-200 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile Settings
                </button>
               
              
                <hr className="my-2 border-gray-200" />
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-inter-tight transition-colors duration-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </header>
  );
}