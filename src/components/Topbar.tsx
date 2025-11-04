import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, User, LogOut, Menu } from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import ProfileSettingsModal from './modal/ProfileSettingsModal';
import { useSearch } from '../context/SearchContext';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
  currentPage?: string;
}

export default function Topbar({ onToggleMobileMenu, currentPage: propCurrentPage }: TopbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Admin User');
  const [userEmail, setUserEmail] = useState<string>('admin@mysunlight.com');
  const { searchQuery, setSearchQuery, currentPage: contextCurrentPage } = useSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use prop currentPage if provided, otherwise fall back to context
  const currentPage = propCurrentPage || contextCurrentPage;

  // Determine if search should be shown (only on users page)
  const showSearch = currentPage === 'users';

  // Listen for auth state changes and update user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserPhoto(user.photoURL);
        setUserName(user.displayName || 'Admin User');
        setUserEmail(user.email || 'admin@mysunlight.com');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // The app will automatically redirect to SignIn page due to auth state listener in App.tsx
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearchKeyDown = () => {
    // Search functionality is now only on users page
    // No navigation needed as search is already on users page
  };

  // Focus search input when on users page and there's a search query
  useEffect(() => {
    if (currentPage === 'users' && searchQuery.trim() && searchInputRef.current) {
      // Small delay to ensure the page has rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [currentPage, searchQuery]);

  return (
    <header className="h-16 md:h-20 border-b border-gray-400/50 shadow-lg">
      <div className="h-full flex items-center justify-between px-3 md:px-6">
        {/* Left Section - Mobile Menu Button + Search/Profile */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Search Bar - Hidden on mobile, only show on users page */}
          {showSearch && (
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={currentPage === 'users' ? 'Search users...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-gray-400/50 rounded-lg focus:outline-none focus:border-gray-400/50 text-sm font-inter-tight"
                />
              </div>
            </div>
          )}

          {/* User Profile - Show on left when search is hidden (notifications/analytics pages) - pushed to end */}
          {!showSearch && (
            <div className="hidden md:flex items-center gap-2 md:gap-4 ml-auto">
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Profile menu"
                  className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-manrope font-medium text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-600 font-inter-tight">{userEmail}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      showProfileMenu ? 'rotate-180' : ''
                    }`}
                  />
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
          )}
        </div>

        {/* Mobile Logo */}
        <div className="flex md:hidden items-center gap-2">
          <img src="/assets/Logo.svg" alt="MySunlight Logo" className="h-8 w-8" />
          <h1 className="text-lg font-david-libre font-bold text-gray-800">MySunlight</h1>
        </div>

        {/* Right Section - Profile (only when search is visible) */}
        {showSearch && (
          <div className="flex items-center gap-2 md:gap-4">
            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Profile menu"
                className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-manrope font-medium text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-600 font-inter-tight">{userEmail}</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    showProfileMenu ? 'rotate-180' : ''
                  }`}
                />
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
        )}
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </header>
  );
}
