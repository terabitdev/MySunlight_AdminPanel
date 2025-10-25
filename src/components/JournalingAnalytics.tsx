import { useEffect } from 'react';
import { BookOpen, FileText, BarChart3, Calendar, Lightbulb } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchJournalingAnalytics, clearJournalingStats } from '../store/journalingSlice';

interface JournalingAnalyticsProps {
  userId: string;
}

export default function JournalingAnalytics({ userId }: JournalingAnalyticsProps) {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.journaling);

  useEffect(() => {
    // Clear previous stats when userId changes
    dispatch(clearJournalingStats());

    // Fetch new stats
    dispatch(fetchJournalingAnalytics(userId));
  }, [userId, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 font-inter-tight text-sm">Loading journaling data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-600 font-inter-tight mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchJournalingAnalytics(userId))}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800 font-manrope">Journaling Analytics</h3>
          <p className="text-sm text-gray-600 font-inter-tight">User's journaling activity and insights</p>
        </div>
      </div>

      {stats.entriesCount === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-inter-tight">No journal entries found for this user.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Entries */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900 font-inter-tight">Total Entries</p>
              </div>
              <p className="text-3xl font-bold text-blue-700 font-manrope">{stats.entriesCount}</p>
            </div>

            {/* Average Word Count */}
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900 font-inter-tight">Avg. Words</p>
              </div>
              <p className="text-3xl font-bold text-green-700 font-manrope">{stats.averageWordCount}</p>
            </div>

            {/* Frequency */}
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900 font-inter-tight">Frequency</p>
              </div>
              <p className="text-lg font-bold text-purple-700 font-manrope leading-tight">{stats.frequency}</p>
            </div>

            {/* Last Entry */}
            <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium text-orange-900 font-inter-tight">Last Entry</p>
              </div>
              <p className="text-sm font-bold text-orange-700 font-manrope leading-tight">{stats.lastEntryDate}</p>
            </div>
          </div>

          {/* Prompt Usage */}
          {stats.promptUsage.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <h4 className="text-base font-semibold text-gray-800 font-manrope">
                  Most Used Prompts
                </h4>
              </div>

              <div className="space-y-3">
                {stats.promptUsage.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-inter-tight leading-relaxed">
                        {item.prompt}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 font-inter-tight">
                          Type: <span className="font-medium text-gray-700">{item.type}</span>
                        </span>
                        <span className="text-xs text-gray-500 font-inter-tight">
                          Used: <span className="font-medium text-blue-600">{item.count} times</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
