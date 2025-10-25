import { useEffect } from 'react';
import { Heart, Wind, CheckCircle, TrendingUp, Clock, Lightbulb } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCopingToolsAnalytics, clearCopingToolsStats } from '../store/copingToolsSlice';

interface DailyCopingToolsAnalyticsProps {
  userId: string;
}

export default function DailyCopingToolsAnalytics({ userId }: DailyCopingToolsAnalyticsProps) {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.copingTools);

  useEffect(() => {
    // Clear previous stats when userId changes
    dispatch(clearCopingToolsStats());

    // Fetch new stats
    dispatch(fetchCopingToolsAnalytics(userId));
  }, [userId, dispatch]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600 font-inter-tight text-sm">Loading coping tools data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-yellow-800 font-inter-tight mb-2 font-medium">Analytics Data Not Available</p>
          <p className="text-yellow-700 font-inter-tight text-sm mb-3">
            Firebase Analytics events need to be logged to Firestore for admin dashboard access.
          </p>
          <button
            onClick={() => dispatch(fetchCopingToolsAnalytics(userId))}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasData =
    stats.totalTipsViewed > 0 ||
    stats.breathingExercisesStarted > 0 ||
    stats.breathingExercisesCompleted > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <Heart className="h-6 w-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800 font-manrope">Daily Coping Tools</h3>
          <p className="text-sm text-gray-600 font-inter-tight">
            User's engagement with daily tips and breathing exercises
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-inter-tight">No coping tools activity found for this user.</p>
          <p className="text-gray-500 font-inter-tight text-sm mt-2">
            Analytics events will appear here once the user engages with daily tips and breathing exercises.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tips Viewed */}
            <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-medium text-amber-900 font-inter-tight">Tips Viewed</p>
              </div>
              <p className="text-3xl font-bold text-amber-700 font-manrope">{stats.totalTipsViewed}</p>
              <p className="text-xs text-amber-600 mt-1 font-inter-tight">
                {stats.uniqueTipsViewed} unique
              </p>
            </div>

            {/* Exercises Started */}
            <div className="bg-linear-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="h-5 w-5 text-cyan-600" />
                <p className="text-sm font-medium text-cyan-900 font-inter-tight">Exercises Started</p>
              </div>
              <p className="text-3xl font-bold text-cyan-700 font-manrope">
                {stats.breathingExercisesStarted}
              </p>
            </div>

            {/* Exercises Completed */}
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900 font-inter-tight">Completed</p>
              </div>
              <p className="text-3xl font-bold text-green-700 font-manrope">
                {stats.breathingExercisesCompleted}
              </p>
            </div>

            {/* Completion Rate */}
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900 font-inter-tight">Completion Rate</p>
              </div>
              <p className="text-3xl font-bold text-purple-700 font-manrope">
                {stats.completionRate}%
              </p>
              {stats.averageExerciseDuration > 0 && (
                <p className="text-xs text-purple-600 mt-1 font-inter-tight flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Avg: {formatDuration(stats.averageExerciseDuration)}
                </p>
              )}
            </div>
          </div>

          {/* Most Viewed Tips */}
          {stats.mostViewedTips.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h4 className="text-base font-semibold text-gray-800 font-manrope">Most Viewed Tips</h4>
              </div>

              <div className="space-y-2">
                {stats.mostViewedTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 bg-amber-600 text-white rounded-full font-bold text-xs shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-800 font-inter-tight">Tip ID: {tip.tipId}</p>
                    </div>
                    <span className="text-sm font-medium text-amber-700 font-manrope">
                      {tip.count} views
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Tip Views */}
            {stats.recentTipViews.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  <h4 className="text-base font-semibold text-gray-800 font-manrope">
                    Recent Tip Views
                  </h4>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.recentTipViews.map((view, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm text-gray-700 font-inter-tight">{view.tipId}</span>
                      <span className="text-xs text-gray-500 font-inter-tight">
                        {formatTimestamp(view.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Breathing Exercises */}
            {stats.recentBreathingExercises.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Wind className="h-5 w-5 text-cyan-600" />
                  <h4 className="text-base font-semibold text-gray-800 font-manrope">
                    Recent Breathing Exercises
                  </h4>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.recentBreathingExercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            exercise.status === 'completed' ? 'bg-green-500' : 'bg-cyan-500'
                          }`}
                        ></span>
                        <span className="text-sm text-gray-700 font-inter-tight capitalize">
                          {exercise.status}
                        </span>
                        {exercise.duration && (
                          <span className="text-xs text-gray-500 font-inter-tight">
                            ({formatDuration(exercise.duration)})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-inter-tight">
                        {formatTimestamp(exercise.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Implementation Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-inter-tight">
          <strong>Note:</strong> To display real analytics data, implement dual-logging of Firebase
          Analytics events to Firestore, or use Firebase Analytics Data Export to BigQuery.
        </p>
      </div>
    </div>
  );
}
