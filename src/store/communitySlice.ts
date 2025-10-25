import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface GroupJoined {
  groupId: string;
  groupName: string;
  joinedAt: string;
  griefType: string;
}

interface PostCreated {
  postId: string;
  groupId: string;
  groupName: string;
  content: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
}

interface CommentMade {
  commentId: string;
  postId: string;
  groupId: string;
  content: string;
  timestamp: string;
}

export interface CommunityStats {
  groupsJoinedCount: number;
  postsCreatedCount: number;
  commentsMadeCount: number;
  totalReactions: number;
  groupsJoined: GroupJoined[];
  recentPosts: PostCreated[];
  recentComments: CommentMade[];
  mostActiveGroup: { groupName: string; activityCount: number } | null;
}

interface CommunityState {
  stats: CommunityStats;
  loading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  stats: {
    groupsJoinedCount: 0,
    postsCreatedCount: 0,
    commentsMadeCount: 0,
    totalReactions: 0,
    groupsJoined: [],
    recentPosts: [],
    recentComments: [],
    mostActiveGroup: null,
  },
  loading: false,
  error: null,
};

// Async thunk to fetch community analytics
export const fetchCommunityAnalytics = createAsyncThunk(
  'community/fetchAnalytics',
  async (userId: string, { rejectWithValue }) => {
    try {
      // 1. Fetch groups joined by the user
      const groupsQuery = query(collection(db, 'groups'));
      const groupsSnapshot = await getDocs(groupsQuery);

      const groupsJoined: GroupJoined[] = [];
      const groupActivityMap = new Map<string, number>();

      for (const groupDoc of groupsSnapshot.docs) {
        const groupData = groupDoc.data();
        const groupId = groupDoc.id;

        // Check if user is in joinedUsers array OR adminUsers array
        const joinedUsers = groupData.joinedUsers || [];
        const adminUsers = groupData.adminUsers || [];

        // Check if user is in joinedUsers array
        // joinedUsers is a simple array of user ID strings: ['userId1', 'userId2', ...]
        const isJoinedUser = joinedUsers.includes(userId);

        // Also check if user is an admin
        const isAdminUser = adminUsers.includes(userId);

        // Also check if user is the creator
        const isCreator = groupData.createdBy === userId;

        let userJoinData = null;

        if (isJoinedUser || isAdminUser || isCreator) {
          userJoinData = {
            userId: userId,
            joinedAt: groupData.createdAt || null, // Use group creation time as fallback
          };
        }

        if (userJoinData) {
          let joinedAtString = 'N/A';
          if (userJoinData.joinedAt && typeof userJoinData.joinedAt.toDate === 'function') {
            joinedAtString = new Date(userJoinData.joinedAt.toDate()).toISOString();
          } else if (userJoinData.joinedAt instanceof Date) {
            joinedAtString = userJoinData.joinedAt.toISOString();
          } else if (typeof userJoinData.joinedAt === 'string') {
            joinedAtString = userJoinData.joinedAt;
          }

          groupsJoined.push({
            groupId: groupId,
            groupName: groupData.name || 'Unknown Group',
            joinedAt: joinedAtString,
            griefType: groupData.griefType || 'Unknown',
          });

          groupActivityMap.set(groupId, 0);
        }
      }

      // 2. Fetch posts created by the user across all groups
      const recentPosts: PostCreated[] = [];
      let totalPostReactions = 0;

      for (const group of groupsJoined) {
        const postsRef = collection(db, 'groups', group.groupId, 'posts');

        const postsQuery = query(
          postsRef,
          where('authorId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        try {
          const postsSnapshot = await getDocs(postsQuery);

          postsSnapshot.forEach((postDoc) => {
            const postData = postDoc.data();

            let timestampString = 'N/A';
            if (postData.createdAt && typeof postData.createdAt.toDate === 'function') {
              timestampString = new Date(postData.createdAt.toDate()).toISOString();
            } else if (postData.createdAt instanceof Date) {
              timestampString = postData.createdAt.toISOString();
            } else if (typeof postData.createdAt === 'string') {
              timestampString = postData.createdAt;
            }

            recentPosts.push({
              postId: postDoc.id,
              groupId: group.groupId,
              groupName: group.groupName,
              content: postData.content || '',
              timestamp: timestampString,
              likesCount: postData.likesCount || 0,
              commentsCount: postData.commentsCount || 0,
            });

            // Count reactions (likes)
            totalPostReactions += postData.likesCount || 0;

            // Track group activity
            const currentActivity = groupActivityMap.get(group.groupId) || 0;
            groupActivityMap.set(group.groupId, currentActivity + 1);
          });
        } catch (error) {
          // Silently handle errors for individual groups
        }
      }

      // 3. Fetch comments made by the user
      const recentComments: CommentMade[] = [];

      for (const group of groupsJoined) {
        const postsRef = collection(db, 'groups', group.groupId, 'posts');
        const postsSnapshot = await getDocs(postsRef);

        for (const postDoc of postsSnapshot.docs) {
          const commentsRef = collection(db, 'groups', group.groupId, 'posts', postDoc.id, 'comments');
          const commentsQuery = query(
            commentsRef,
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
          );

          try {
            const commentsSnapshot = await getDocs(commentsQuery);

            commentsSnapshot.forEach((commentDoc) => {
              const commentData = commentDoc.data();

              recentComments.push({
                commentId: commentDoc.id,
                postId: postDoc.id,
                groupId: group.groupId,
                content: commentData.content || '',
                timestamp: commentData.createdAt
                  ? new Date(commentData.createdAt.toDate()).toISOString()
                  : 'N/A',
              });

              // Track group activity
              const currentActivity = groupActivityMap.get(group.groupId) || 0;
              groupActivityMap.set(group.groupId, currentActivity + 1);
            });
          } catch (error) {
            // Silently handle errors for individual posts
          }
        }
      }

      // 4. Find most active group
      let mostActiveGroup: { groupName: string; activityCount: number } | null = null;
      let maxActivity = 0;

      groupActivityMap.forEach((activityCount, groupId) => {
        if (activityCount > maxActivity) {
          maxActivity = activityCount;
          const group = groupsJoined.find((g) => g.groupId === groupId);
          if (group) {
            mostActiveGroup = {
              groupName: group.groupName,
              activityCount: activityCount,
            };
          }
        }
      });

      // Sort posts and comments by timestamp (newest first)
      recentPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      recentComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const stats: CommunityStats = {
        groupsJoinedCount: groupsJoined.length,
        postsCreatedCount: recentPosts.length,
        commentsMadeCount: recentComments.length,
        totalReactions: totalPostReactions,
        groupsJoined: groupsJoined,
        recentPosts: recentPosts.slice(0, 5), // Top 5 recent posts
        recentComments: recentComments.slice(0, 5), // Top 5 recent comments
        mostActiveGroup: mostActiveGroup,
      };

      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch community analytics');
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearCommunityStats: (state) => {
      state.stats = initialState.stats;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunityAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunityAnalytics.fulfilled, (state, action: PayloadAction<CommunityStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCommunityAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCommunityStats, clearError } = communitySlice.actions;
export default communitySlice.reducer;
