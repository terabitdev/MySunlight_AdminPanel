import { useEffect, useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChevronDown, TrendingUp, Users, Calendar, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUsers, type User } from '../store/userSlice';

interface MonthlyGrowth {
  month: string;
  count: number;
  percentage: number;
  isSelected: boolean;
}

export default function Analytics() {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getCurrentMonth = () => months[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Calculate user growth data by month
  const chartData = useMemo(() => {
    if (!users || users.length === 0) return [];

    // Get 6 months centered around selected month
    const selectedMonthIndex = months.indexOf(selectedMonth);
    let startIndex = selectedMonthIndex - 2;
    let endIndex = selectedMonthIndex + 4;

    if (startIndex < 0) {
      startIndex = 0;
      endIndex = Math.min(6, months.length);
    } else if (endIndex > months.length) {
      endIndex = months.length;
      startIndex = Math.max(0, endIndex - 6);
    }

    const visibleMonths = months.slice(startIndex, endIndex);

    // Count users by month
    const monthlyData = visibleMonths.map((month) => {
      const monthIndex = months.indexOf(month);
      const usersInMonth = users.filter((user: User) => {
        if (!user.createdAt) return false;
        try {
          const date = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return date.getMonth() === monthIndex && date.getFullYear() === selectedYear;
        } catch {
          return false;
        }
      });

      return {
        month: month.substring(0, 3),
        count: usersInMonth.length,
        percentage: 0,
        isSelected: month === selectedMonth,
      };
    });

    // Calculate percentages
    const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
    return monthlyData.map(d => ({
      ...d,
      percentage: (d.count / maxCount) * 100,
    }));
  }, [users, selectedMonth, selectedYear, months]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u: User) => u.isActive).length;
    const verifiedUsers = users.filter((u: User) => u.emailVerified).length;

    // Calculate average journal entries per user
    const totalJournalEntries = users.reduce((sum, user) => sum + (user.journalEntriesCount || 0), 0);
    const averageJournalEntries = totalUsers > 0 ? totalJournalEntries / totalUsers : 0;

    // Calculate growth rate (compare with previous month)
    const selectedMonthIndex = months.indexOf(selectedMonth);
    const currentMonthUsers = users.filter((user: User) => {
      if (!user.createdAt) return false;
      try {
        const date = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        return date.getMonth() === selectedMonthIndex && date.getFullYear() === selectedYear;
      } catch {
        return false;
      }
    }).length;

    const prevMonthIndex = selectedMonthIndex === 0 ? 11 : selectedMonthIndex - 1;
    const prevYear = selectedMonthIndex === 0 ? selectedYear - 1 : selectedYear;
    const prevMonthUsers = users.filter((user: User) => {
      if (!user.createdAt) return false;
      try {
        const date = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        return date.getMonth() === prevMonthIndex && date.getFullYear() === prevYear;
      } catch {
        return false;
      }
    }).length;

    const growthRate = prevMonthUsers === 0
      ? (currentMonthUsers > 0 ? 100 : 0)
      : ((currentMonthUsers - prevMonthUsers) / prevMonthUsers) * 100;

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      currentMonthUsers,
      growthRate,
      averageJournalEntries,
      totalJournalEntries,
    };
  }, [users, selectedMonth, selectedYear, months]);

  const getAvailableYears = () => {
    const currentYear = getCurrentYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter-tight">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-david-libre font-bold text-gray-800 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 font-inter-tight mt-1">
          Track user growth and engagement metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-inter-tight opacity-90">Total Users</p>
            <Users className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold font-manrope">{stats.totalUsers}</p>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-inter-tight opacity-90">Active Users</p>
            <Users className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold font-manrope">{stats.activeUsers}</p>
          <p className="text-xs opacity-75 mt-1 font-inter-tight">
            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-inter-tight opacity-90">Avg Journal Entries</p>
            <BookOpen className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold font-manrope">
            {stats.averageJournalEntries.toFixed(1)}
          </p>
          <p className="text-xs opacity-75 mt-1 font-inter-tight">
            {stats.totalJournalEntries} total entries
          </p>
        </div>

        <div className={`bg-linear-to-br ${stats.growthRate >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} rounded-lg shadow-md p-5 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-inter-tight opacity-90">Growth Rate</p>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold font-manrope">
            {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
          </p>
          <p className="text-xs opacity-75 mt-1 font-inter-tight">vs previous month</p>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-semibold text-gray-900 font-manrope flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              New Users Growth
            </h2>
            <p className="text-sm text-gray-600 font-inter-tight mt-1">
              Monthly user registration trends
            </p>
          </div>

          {/* Date Selectors */}
          <div className="flex items-center gap-2">
            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-w-[90px] font-manrope"
              >
                <span>{selectedYear}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showYearDropdown && (
                <div className="absolute right-0 mt-2 w-28 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {getAvailableYears().map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowYearDropdown(false);
                      }}
                      className={`block w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors font-manrope ${
                        year === selectedYear
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-900'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Month Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-w-[130px] font-manrope"
              >
                <span>{selectedMonth}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showMonthDropdown && (
                <div className="absolute right-0 mt-2 w-40 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        setSelectedMonth(month);
                        setShowMonthDropdown(false);
                      }}
                      className={`block w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors font-manrope ${
                        month === selectedMonth
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-900'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Month Stats */}
        <div className="mb-6 ">
          <p className="text-sm text-gray-600 font-inter-tight">
            New users in {selectedMonth} {selectedYear}:
            <span className="ml-2 text-lg font-semibold text-gray-900 font-manrope">
              {stats.currentMonthUsers}
            </span>
          </p>
        </div>

        {/* Chart */}
        <div className="h-96 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="customGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D3E4E8" stopOpacity={0.8} />
                    <stop offset="30%" stopColor="#E3E9E8" stopOpacity={0.6} />
                    <stop offset="70%" stopColor="#FBF3EB" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FCE3D2" stopOpacity={0.2} />
                  </linearGradient>

                  <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: '#6b7280', fontFamily: 'Inter Tight' }}
                  dy={10}
                  interval={0}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: '#6b7280', fontFamily: 'Inter Tight' }}
                  tickFormatter={(value) => `${value}%`}
                  dx={-10}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as MonthlyGrowth;
                      return (
                        <div className="bg-white px-4 py-3 border-2 border-blue-500 rounded-lg shadow-xl">
                          <p className="text-sm font-semibold text-gray-900 font-manrope mb-1">
                            {data.month}
                          </p>
                          <p className="text-lg font-bold text-blue-600 font-manrope">
                            {data.count} user{data.count !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500 font-inter-tight">
                            {data.percentage.toFixed(1)}% of peak
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="url(#strokeGradient)"
                  strokeWidth={3}
                  fill="url(#customGradient)"
                  dot={(props) => {
                    const { payload } = props;
                    if (payload?.isSelected) {
                      return (
                        <g key={props.index ?? `${props.cx}-${props.cy}`}>
                          {/* Highlighted circle for selected month */}
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={10}
                            fill="#ffffff"
                            stroke="#2563eb"
                            strokeWidth={3}
                          />
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={5}
                            fill="#2563eb"
                          />
                        </g>
                      );
                    }
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 8, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 font-inter-tight">No data available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
