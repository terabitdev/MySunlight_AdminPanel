import { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  LogOut,
  Flag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface SidebarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  onNavigate,
  currentPage = 'dashboard',
  isMobileMenuOpen = false,
  onCloseMobileMenu,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // const menuItems = [
  //   {
  //     id: 'dashboard',
  //     icon: LayoutDashboard,
  //     label: 'Dashboard',
  //   },
  //   {
  //     id: 'notifications',
  //     icon: Flag,
  //     label: 'Flagged Content',
  //   },
  //   {
  //     id: 'analytics',
  //     icon: BarChart3,
  //     label: 'Analytics',
  //   },
  //   {
  //     id: 'users',
  //     icon: Users,
  //     label: 'Users',
  //   },
  // ];
  const menuItems = [
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Dashboard',
    },
    {
      id: 'notifications',
      icon: Flag,
      label: 'Flagged Content',
    },
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'User Feedback',
      // id: 'analytics',
      // icon: BarChart3,
      // label: 'Dashboard',
    },
    {
      id: 'users',
      icon: Users,
      label: 'User Analytics',
    },
  ];
  // const menuItems = [
  //   {
  //     id: 'dashboard',
  //     icon: LayoutDashboard,
  //     label: 'Dashboard',
  //   },
  //   {
  //     id: 'notifications',
  //     icon: Flag,
  //     label: 'Flagged Content',
  //   },
  //   {
  //     id: 'analytics',
  //     icon: BarChart3,
  //     label: 'Analytics',
  //   },
  //   {
  //     id: 'users',
  //     icon: Users,
  //     label: 'Users',
  //   },
  // ];

  const handleItemClick = (item: (typeof menuItems)[0]) => {
    if (onNavigate) {
      onNavigate(item.id);
    }
    // Close mobile menu after navigation
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onCloseMobileMenu} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          h-full border-r border-gray-400/50 shadow-2xl bg-custom-page-gradient
          transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-20 md:w-20' : 'w-72'}
        `}
      >
        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex absolute top-4 -right-3 p-1.5 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 z-10 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Header */}
        <div
          className={`py-3 border-b border-gray-400/50 h-16 md:h-20 transition-all duration-300 ${
            isCollapsed ? 'px-3' : 'px-4 md:px-6'
          }`}
        >
          <div
            className={`flex items-center justify-between gap-3 mb-1 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {/* Logo - Left Side */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <img
                  src="/assets/Logo.svg"
                  alt="MySunlight Logo"
                  className="h-10 w-10 drop-shadow-md"
                />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-david-libre font-bold text-gray-800 truncate">
                    MySunlight
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 font-inter-tight truncate">
                    Admin Panel
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Collapse/Expand Toggle Button - Right Side */}
            <button
              onClick={onToggleCollapse}
              className="md:hidden shrink-0 p-1.5 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4  text-gray-600 " />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}
          style={{ height: 'calc(100% - 5rem)' }}
        >
          <div className="mt-4 flex-1">
            {!isCollapsed && (
              <h2 className="text-sm font-inter-tight font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">
                Main Menu
              </h2>
            )}

            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = currentPage === item.id;
                const isHovered = hoveredItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                    w-full flex items-center cursor-pointer gap-3 rounded-xl font-manrope font-medium text-lg transition-all duration-200 group
                    ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 text-left'}
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                        : isHovered
                        ? ' text-blue-700 transform scale-[1.01]'
                        : 'text-gray-700 hover:text-blue-600 '
                    }
                  `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout Button - Positioned at bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200/50">
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
              w-full flex items-center cursor-pointer gap-3 rounded-xl font-manrope font-medium text-lg transition-all duration-200 group
              ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 text-left'}
              ${
                hoveredItem === 'logout'
                  ? 'bg-red-50 text-red-700 transform scale-[1.01]'
                  : 'text-gray-600 hover:text-red-600'
              }
            `}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!isCollapsed && <span className="flex-1">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
