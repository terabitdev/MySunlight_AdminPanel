import { Clock, Calendar, TrendingUp, Activity } from 'lucide-react';
import { type User } from '../store/userSlice';

interface RetentionMetricsProps {
  user: User;
}

export default function RetentionMetrics({ user }: RetentionMetricsProps) {
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  const calculateDaysSinceLastActive = (): number | null => {
    if (!user.dateOfLastActivity) return null;

    try {
      const lastActiveDate = user.dateOfLastActivity.toDate
        ? user.dateOfLastActivity.toDate()
        : new Date(user.dateOfLastActivity);

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch {
      return null;
    }
  };

  const getActivityStatus = (days: number | null): {
    text: string;
    color: string;
    bgColor: string;
  } => {
    if (days === null) {
      return {
        text: 'Unknown',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100'
      };
    }

    if (days === 0) {
      return {
        text: 'Active Today',
        color: 'text-green-700',
        bgColor: 'bg-green-100'
      };
    } else if (days === 1) {
      return {
        text: 'Active Yesterday',
        color: 'text-green-700',
        bgColor: 'bg-green-100'
      };
    } else if (days <= 7) {
      return {
        text: 'Recently Active',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100'
      };
    } else if (days <= 30) {
      return {
        text: 'Moderately Active',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100'
      };
    } else {
      return {
        text: 'Inactive',
        color: 'text-red-700',
        bgColor: 'bg-red-100'
      };
    }
  };

  const daysSinceLastActive = calculateDaysSinceLastActive();
  const activityStatus = getActivityStatus(daysSinceLastActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <TrendingUp className="h-6 w-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800 font-manrope">Retention Metrics</h3>
          <p className="text-sm text-gray-600 font-inter-tight">
            User activity and engagement patterns over time
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Last Activity Date */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-purple-900 font-inter-tight">Last Activity</p>
          </div>
          <p className="text-lg font-bold text-purple-700 font-manrope">
            {formatTimestamp(user.dateOfLastActivity)}
          </p>
        </div>

        {/* Days Since Last Active */}
        <div className="bg-linear-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <p className="text-sm font-medium text-indigo-900 font-inter-tight">Days Since Active</p>
          </div>
          <p className="text-3xl font-bold text-indigo-700 font-manrope">
            {daysSinceLastActive !== null ? daysSinceLastActive : 'N/A'}
          </p>
          {daysSinceLastActive !== null && (
            <p className="text-xs text-indigo-600 font-inter-tight mt-1">
              {daysSinceLastActive === 0 ? 'Active today' : `${daysSinceLastActive} day${daysSinceLastActive !== 1 ? 's' : ''} ago`}
            </p>
          )}
        </div>

        {/* Activity Status */}
        <div className={`bg-linear-to-br from-${activityStatus.bgColor.split('-')[1]}-50 to-${activityStatus.bgColor.split('-')[1]}-100 rounded-lg p-4 border border-${activityStatus.bgColor.split('-')[1]}-200`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-900 font-inter-tight">Activity Status</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${activityStatus.bgColor} ${activityStatus.color}`}>
            {activityStatus.text}
          </span>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h4 className="text-base font-semibold text-gray-800 font-manrope mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Activity Timeline
        </h4>

        <div className="space-y-3">
          {/* Last Login */}
          {user.lastLoginAt && (
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 font-inter-tight">Last Login</p>
                <p className="text-xs text-gray-600 font-inter-tight mt-1">
                  {formatTimestamp(user.lastLoginAt)}
                </p>
              </div>
            </div>
          )}

          {/* Account Created */}
          {user.createdAt && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 font-inter-tight">Account Created</p>
                <p className="text-xs text-gray-600 font-inter-tight mt-1">
                  {formatTimestamp(user.createdAt)}
                </p>
              </div>
            </div>
          )}

          {/* Updated At */}
          {user.updatedAt && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 font-inter-tight">Profile Last Updated</p>
                <p className="text-xs text-gray-600 font-inter-tight mt-1">
                  {formatTimestamp(user.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Status */}
      {typeof user.onboardingCompleted !== 'undefined' && (
        <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg p-5 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <h4 className="text-base font-semibold text-amber-900 font-manrope">Onboarding Status</h4>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.onboardingCompleted
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {user.onboardingCompleted ? 'Completed' : 'Incomplete'}
            </span>
            {user.onboardingCompleted && (
              <p className="text-sm text-amber-700 font-inter-tight">
                User has completed the onboarding process
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
