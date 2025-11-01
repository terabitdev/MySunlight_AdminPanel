import { useEffect, useState, useMemo } from 'react';
import { Users as UsersIcon, Mail, CheckCircle, Eye, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUsers, type User } from '../store/userSlice';
import UserFilter from '../components/UserFilter';
import Pagination from '../components/Pagination';
import { useSearch } from '../context/SearchContext';
import UserDetailsModal from '../components/modal/UserDetailsModal';

export default function Users() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { searchQuery, setSearchQuery, setCurrentPage: setSearchCurrentPage } = useSearch();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleCloseDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    dispatch(fetchUsers());
    setSearchCurrentPage('users');
  }, [dispatch, setSearchCurrentPage]);

  // Filter users based on active status and search query
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by active status
    if (activeFilter === 'active') {
      filtered = filtered.filter((u: User) => u.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter((u: User) => !u.isActive);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((user: User) => {
        return (
          user.displayName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [users, activeFilter, searchQuery]);

  // Calculate counts for filter
  const activeCount = useMemo(() => users.filter((u: User) => u.isActive).length, [users]);
  const inactiveCount = useMemo(() => users.filter((u: User) => !u.isActive).length, [users]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter-tight">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-inter-tight">{error}</p>
          <button
            onClick={() => dispatch(fetchUsers())}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-david-libre font-bold text-gray-800 flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-blue-600" />
          Users Management
        </h1>
        <p className="text-gray-600 font-inter-tight mt-1">
          {searchQuery.trim() ? (
            <>
              Showing <span className="font-semibold text-blue-600">{filteredUsers.length}</span> result
              {filteredUsers.length !== 1 ? 's' : ''} for "{searchQuery}"
            </>
          ) : (
            'Manage and monitor all registered users'
          )}
        </p>
      </div>

      {/* Search Results Banner */}
      {searchQuery.trim() && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold font-manrope">
              {filteredUsers.length}
            </div>
            <p className="text-gray-700 font-inter-tight">
              {filteredUsers.length === 1 ? 'user' : 'users'} found matching{' '}
              <span className="font-semibold text-blue-700">"{searchQuery}"</span>
            </p>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium font-inter-tight transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Filter */}
      <UserFilter
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        totalCount={users.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <UsersIcon className="h-4 w-4 text-gray-600" />
            <p className="text-sm text-gray-600 font-inter-tight">Total Users</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 font-manrope">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <p className="text-sm text-gray-600 font-inter-tight">Total Journal Entries</p>
          </div>
          <p className="text-2xl font-bold text-purple-600 font-manrope">
            {users.reduce((sum, u) => sum + (u.journalEntriesCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-gray-600 font-inter-tight">Verified Emails</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 font-manrope">
            {users.filter((u) => u.emailVerified).length}
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-inter-tight">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-inter-tight">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-inter-tight">
                  Journal Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-inter-tight">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-inter-tight">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-inter-tight">
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={user.displayName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {user.displayName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-manrope">
                            {user.displayName || 'Unknown'}
                          </p>
                          {user.username && (
                            <p className="text-xs text-gray-500 font-inter-tight">@{user.username}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 font-inter-tight">{user.email}</span>
                        {user.emailVerified && (
                          <span title="Verified">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                          {user.journalEntriesCount || 0}
                        </span>
                        <span className="text-sm text-gray-600 font-inter-tight">
                          {user.journalEntriesCount === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-inter-tight">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-inter-tight"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredUsers.length}
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 font-inter-tight">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.uid}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4"
            >
              {/* User Header */}
              <div className="flex items-start gap-3 mb-3">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.displayName}
                    className="h-12 w-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 font-manrope truncate">
                    {user.displayName || 'Unknown'}
                  </h3>
                  {user.username && (
                    <p className="text-sm text-gray-500 font-inter-tight">@{user.username}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                    {user.journalEntriesCount || 0}
                  </span>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-900 font-inter-tight truncate">{user.email}</span>
                  {user.emailVerified && (
                    <span title="Verified" className="shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
                  <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-gray-600 font-inter-tight">Journal Entries:</span>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs ml-auto">
                    {user.journalEntriesCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-inter-tight">Joined:</span>
                  <span className="text-gray-900 font-inter-tight">{formatDate(user.createdAt)}</span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => handleViewDetails(user)}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-inter-tight"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={handleCloseDetails}
        user={selectedUser}
      />
    </div>
  );
}
