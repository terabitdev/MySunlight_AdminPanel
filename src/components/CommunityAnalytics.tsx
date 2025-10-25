import { useEffect } from 'react';
import { Users, MessageSquare, Heart, TrendingUp, Calendar, Hash } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCommunityAnalytics, clearCommunityStats } from '../store/communitySlice';

interface CommunityAnalyticsProps {
  userId: string;
}

export default function CommunityAnalytics({ userId }: CommunityAnalyticsProps) {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.community);

  useEffect(() => {
    // Clear previous stats when userId changes
    dispatch(clearCommunityStats());

    // Fetch new stats
    dispatch(fetchCommunityAnalytics(userId));
  }, [userId, dispatch]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-600 font-inter-tight text-sm">Loading community data...</p>
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
            onClick={() => dispatch(fetchCommunityAnalytics(userId))}
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
        <Users className="h-6 w-6 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800 font-manrope">Community Analytics</h3>
          <p className="text-sm text-gray-600 font-inter-tight">
            User's engagement with support groups and community
          </p>
        </div>
      </div>

      {stats.groupsJoinedCount === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-inter-tight">No community activity found for this user.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Groups Joined */}
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900 font-inter-tight">Groups Joined</p>
              </div>
              <p className="text-3xl font-bold text-green-700 font-manrope">{stats.groupsJoinedCount}</p>
            </div>

            {/* Posts Created */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900 font-inter-tight">Posts Created</p>
              </div>
              <p className="text-3xl font-bold text-blue-700 font-manrope">{stats.postsCreatedCount}</p>
            </div>

            {/* Comments Made */}
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900 font-inter-tight">Comments Made</p>
              </div>
              <p className="text-3xl font-bold text-purple-700 font-manrope">{stats.commentsMadeCount}</p>
            </div>

            {/* Total Reactions */}
            <div className="bg-linear-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-pink-600" />
                <p className="text-sm font-medium text-pink-900 font-inter-tight">Total Reactions</p>
              </div>
              <p className="text-3xl font-bold text-pink-700 font-manrope">{stats.totalReactions}</p>
            </div>
          </div>

          {/* Most Active Group */}
          {stats.mostActiveGroup && (
            <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                <h4 className="text-base font-semibold text-amber-900 font-manrope">Most Active Group</h4>
              </div>
              <p className="text-lg font-bold text-amber-800 font-manrope">{stats.mostActiveGroup.groupName}</p>
              <p className="text-sm text-amber-700 font-inter-tight mt-1">
                {stats.mostActiveGroup.activityCount} posts & comments
              </p>
            </div>
          )}

          {/* Groups Joined List */}
          {stats.groupsJoined.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="text-base font-semibold text-gray-800 font-manrope">Groups Joined</h4>
              </div>

              <div className="space-y-3">
                {stats.groupsJoined.map((group, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 font-inter-tight">
                        {group.groupName}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500 font-inter-tight">
                          Grief Type: <span className="font-medium text-gray-700">{group.griefType}</span>
                        </span>
                        <span className="text-xs text-gray-500 font-inter-tight flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined: <span className="font-medium text-green-700">{formatTimestamp(group.joinedAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Posts */}
          {stats.recentPosts.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h4 className="text-base font-semibold text-gray-800 font-manrope">Recent Posts</h4>
              </div>

              <div className="space-y-3">
                {stats.recentPosts.map((post, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-blue-900 font-inter-tight">
                        {post.groupName}
                      </p>
                      <span className="text-xs text-gray-500 font-inter-tight whitespace-nowrap">
                        {formatTimestamp(post.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-inter-tight leading-relaxed mb-2 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600 font-inter-tight flex items-center gap-1">
                        <Heart className="h-3 w-3 text-pink-500" />
                        {post.likesCount} likes
                      </span>
                      <span className="text-xs text-gray-600 font-inter-tight flex items-center gap-1">
                        <Hash className="h-3 w-3 text-purple-500" />
                        {post.commentsCount} comments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Comments */}
          {stats.recentComments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5 text-purple-600" />
                <h4 className="text-base font-semibold text-gray-800 font-manrope">Recent Comments</h4>
              </div>

              <div className="space-y-3">
                {stats.recentComments.map((comment, index) => (
                  <div
                    key={index}
                    className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs text-purple-700 font-inter-tight font-medium">
                        Comment on Post
                      </span>
                      <span className="text-xs text-gray-500 font-inter-tight whitespace-nowrap">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-inter-tight leading-relaxed line-clamp-2">
                      {comment.content}
                    </p>
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
