import { X, User as UserIcon, Mail, Calendar, Shield } from 'lucide-react';
import { type User } from '../../store/userSlice';
import JournalingAnalytics from '../JournalingAnalytics';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-blue-600 font-bold text-xl">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white font-manrope">
                  {user.displayName || 'Unknown User'}
                </h2>
                {user.username && (
                  <p className="text-blue-100 text-sm font-inter-tight">@{user.username}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {/* User Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 font-manrope mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
                User Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider font-inter-tight">
                      Email
                    </p>
                  </div>
                  <p className="text-sm text-gray-900 font-inter-tight break-all">{user.email}</p>
                  {user.emailVerified && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      <Shield className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>



                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider font-inter-tight">
                      Account Status
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Created At */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider font-inter-tight">
                      Joined
                    </p>
                  </div>
                  <p className="text-sm text-gray-900 font-inter-tight">{formatDate(user.createdAt)}</p>
                </div>

                {/* Sign In Method */}
                {user.signInMethod && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wider font-inter-tight">
                        Sign In Method
                      </p>
                    </div>
                    <p className="text-sm text-gray-900 font-inter-tight capitalize">
                      {user.signInMethod}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Journaling Analytics Section */}
            <div className="border-t border-gray-200 pt-6">
              <JournalingAnalytics userId={user.uid} />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-manrope font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
