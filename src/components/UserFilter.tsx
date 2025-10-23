import { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface UserFilterProps {
  activeFilter: 'all' | 'active' | 'inactive';
  onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export default function UserFilter({
  activeFilter,
  onFilterChange,
  totalCount,
  activeCount,
  inactiveCount,
}: UserFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { value: 'all' as const, label: 'All Users', count: totalCount },
    { value: 'active' as const, label: 'Active', count: activeCount },
    { value: 'inactive' as const, label: 'Inactive', count: inactiveCount },
  ];

  const selectedOption = filterOptions.find((opt) => opt.value === activeFilter);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: 'all' | 'active' | 'inactive') => {
    onFilterChange(value);
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-inter-tight">
          Filter Users
        </h3>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full sm:w-64 flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-manrope"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-medium">{selectedOption?.label}</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-inter-tight">
              {selectedOption?.count}
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full sm:w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 text-left transition-colors font-manrope
                  ${
                    activeFilter === option.value
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span>{option.label}</span>
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-inter-tight
                    ${
                      activeFilter === option.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
