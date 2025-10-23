import { useState } from 'react';
import { LayoutDashboard, BarChart3, Users, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface SidebarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export default function Sidebar({ onNavigate, currentPage = 'dashboard' }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard'
    },
    {
      id: 'analytics',
      label: 'Analytics'
    },
    {
      id: 'users',
      label: 'Users'
    }
  ];

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  return (
    <aside className="w-72 h-full border-r border-gray-400/50 shadow-2xl ">
      {/* Header */}
      <div className="py-3 px-6 h-20 border-b border-gray-400/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="relative">
            <img 
              src="/assets/Logo.svg" 
              alt="MySunlight Logo" 
              className="h-10 w-10 drop-shadow-md" 
            />
          </div>
          <div>
            <h1 className="text-2xl font-david-libre font-bold text-gray-800">MySunlight</h1>
            <p className="text-sm text-gray-600 font-inter-tight">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex flex-col" style={{ height: 'calc(100% - 5rem)' }}>
        <div className="mt-4 flex-1">
          <h2 className="text-sm font-inter-tight font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">
            Main Menu
          </h2>
          
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
                    w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl font-manrope font-medium text-lg text-left transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]' 
                      : isHovered
                        ? ' text-blue-700 transform scale-[1.01]'
                        : 'text-gray-700 hover:text-blue-600 '
                    }
                  `}
                >
                  {item.id === 'dashboard' && <LayoutDashboard className="w-4 h-4" />}
                  {item.id === 'analytics' && <BarChart3 className="w-4 h-4" />}
                  {item.id === 'users' && <Users className="w-4 h-4" />}
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
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
              w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl font-manrope font-medium text-lg text-left transition-all duration-200 group
              ${hoveredItem === 'logout'
                ? 'bg-red-50 text-red-700 transform scale-[1.01]'
                : 'text-gray-600 hover:text-red-600'
              }
            `}
          >
            <LogOut className="w-4 h-4" />
            <span className="flex-1">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}