import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface NotificationMetadata {
  groupName: string;
  messageContent: string;
  postContent?: string;
  postId: string;
  groupId: string;
  profileImageUrl?: string;
  senderName: string;
  username: string;
}

export interface FlaggedNotification {
  id: string;
  message: string;
  metadata: NotificationMetadata;
  createdAt: Timestamp | null;
  isRead: boolean;
  type: string;
}

interface NotificationsState {
  notifications: FlaggedNotification[];
  loading: boolean;
  error: string | null;
  processingId: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
  processingId: null,
};

// Fetch flagged notifications
export const fetchFlaggedNotifications = createAsyncThunk(
  'notifications/fetchFlaggedNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('type', '==', 'content_flag')
      );
      const querySnapshot = await getDocs(q);

      const flaggedData: FlaggedNotification[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // Validate metadata structure - CRITICAL for approve/delete operations
        const metadata = data.metadata || {};

        // groupId and message are at the root level of the notification document
        const groupId = data.groupId || '';
        const message = data.message || '';
        const postId = metadata.postId || '';

        // Log missing fields for debugging
        if (!postId) {
          console.warn(`Notification ${docSnap.id} missing metadata.postId`);
        }
        if (!groupId) {
          console.warn(`Notification ${docSnap.id} missing groupId (root level)`);
        }

        flaggedData.push({
          id: docSnap.id,
          message: message, // Read from root level
          metadata: {
            groupName: metadata.groupName || 'Unknown Group',
            messageContent: metadata.messageContent || '',
            postContent: metadata.postContent || '',
            postId: postId,
            groupId: groupId, // Read from root level
            profileImageUrl: metadata.profileImageUrl || '',
            senderName: metadata.senderName || 'Unknown User',
            username: metadata.username || 'unknown',
          },
          createdAt: data.createdAt || null,
          isRead: data.isRead || false,
          type: data.type,
        });
      });

      // Sort by newest first
      flaggedData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

      return flaggedData;
    } catch (error: any) {
      console.error('Error fetching flagged notifications:', error);
      return rejectWithValue(error.message || 'Failed to fetch flagged notifications');
    }
  }
);

// Approve post (unhide and remove all flags)
export const approvePost = createAsyncThunk(
  'notifications/approvePost',
  async (notification: FlaggedNotification, { rejectWithValue }) => {
    try {
      const { groupId, postId } = notification.metadata;

      // Validate required fields
      if (!groupId || !postId) {
        throw new Error('Missing groupId or postId in notification metadata');
      }

      // 1. Unhide and unflag the post
      const postRef = doc(db, 'groups', groupId, 'posts', postId);

      await updateDoc(postRef, {
        isHidden: false,
        isFlagged: false,
      });

      // 2. Delete ALL flag notifications for this post (removes from all admins)
      const flagNotificationsQuery = query(
        collection(db, 'notifications'),
        where('type', '==', 'content_flag'),
        where('metadata.postId', '==', postId)
      );

      const flagNotifications = await getDocs(flagNotificationsQuery);

      // Use batch for atomic deletion
      const batch = writeBatch(db);
      flagNotifications.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return postId;
    } catch (error: any) {
      console.error('Error approving post:', error);
      return rejectWithValue(error.message || 'Failed to approve post');
    }
  }
);

// Delete post and all related notifications
export const deletePost = createAsyncThunk(
  'notifications/deletePost',
  async (notification: FlaggedNotification, { rejectWithValue }) => {
    try {
      const { groupId, postId } = notification.metadata;

      // Validate required fields
      if (!groupId || !postId) {
        throw new Error('Missing groupId or postId in notification metadata');
      }

      // 1. Delete the post
      const postRef = doc(db, 'groups', groupId, 'posts', postId);
      await deleteDoc(postRef);

      // 2. Delete ALL flag notifications for this post (removes from all admins)
      const flagNotificationsQuery = query(
        collection(db, 'notifications'),
        where('type', '==', 'content_flag'),
        where('metadata.postId', '==', postId)
      );

      const flagNotifications = await getDocs(flagNotificationsQuery);

      // Use batch for atomic deletion
      const batch = writeBatch(db);
      flagNotifications.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return postId;
    } catch (error: any) {
      console.error('Error deleting post:', error);
      return rejectWithValue(error.message || 'Failed to delete post');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProcessingId: (state, action: PayloadAction<string | null>) => {
      state.processingId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchFlaggedNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlaggedNotifications.fulfilled, (state, action: PayloadAction<FlaggedNotification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchFlaggedNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Approve post
      .addCase(approvePost.pending, (state) => {
        state.processingId = null;
      })
      .addCase(approvePost.fulfilled, (state, action: PayloadAction<string>) => {
        // Remove all notifications with this postId
        state.notifications = state.notifications.filter(
          (n) => n.metadata.postId !== action.payload
        );
        state.processingId = null;
      })
      .addCase(approvePost.rejected, (state, action) => {
        state.error = action.payload as string;
        state.processingId = null;
      })

      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.processingId = null;
      })
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        // Remove all notifications with this postId
        state.notifications = state.notifications.filter(
          (n) => n.metadata.postId !== action.payload
        );
        state.processingId = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload as string;
        state.processingId = null;
      });
  },
});

export const { clearError, setProcessingId } = notificationsSlice.actions;
export default notificationsSlice.reducer;
