import { useEffect, useState, useMemo } from 'react';
import { Flag, Trash2, CheckCircle, AlertTriangle, Users, MessageSquare, Calendar } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import Toast, { type ToastType } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchFlaggedNotifications,
  approvePost,
  deletePost,
  type FlaggedNotification,
} from '../store/notificationsSlice';

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function Notifications() {
  const dispatch = useAppDispatch();
  const { notifications, loading, error } = useAppSelector(
    (state) => state.notifications
  );
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [localProcessingId, setLocalProcessingId] = useState<string | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    dispatch(fetchFlaggedNotifications());
  }, [dispatch]);

  const handleApprove = async (notification: FlaggedNotification) => {
    // Validate metadata before processing
    if (!notification.metadata.groupId || !notification.metadata.postId) {
      showToast('Missing post information. Cannot approve this notification.', 'error');
      console.error('Missing metadata:', notification.metadata);
      return;
    }

    try {
      setLocalProcessingId(notification.id);
      await dispatch(approvePost(notification)).unwrap();
      showToast('Post approved successfully', 'success');
    } catch (err: any) {
      console.error('Error approving post:', err);
      showToast(err || 'Failed to approve post', 'error');
    } finally {
      setLocalProcessingId(null);
    }
  };

  const handleDelete = async (notification: FlaggedNotification) => {
    // Validate metadata before processing
    if (!notification.metadata.groupId || !notification.metadata.postId) {
      showToast('Missing post information. Cannot delete this notification.', 'error');
      console.error('Missing metadata:', notification.metadata);
      return;
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setLocalProcessingId(notification.id);
      await dispatch(deletePost(notification)).unwrap();
      showToast('Post deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting post:', err);
      showToast(err || 'Failed to delete post', 'error');
    } finally {
      setLocalProcessingId(null);
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

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

  // Group notifications by postId
  const groupedNotifications = useMemo(() => {
    const grouped = new Map<string, FlaggedNotification[]>();
    notifications.forEach((notif) => {
      const postId = notif.metadata.postId;
      if (!postId) {
        console.warn('Notification missing postId:', notif);
        return;
      }
      if (!grouped.has(postId)) {
        grouped.set(postId, []);
      }
      grouped.get(postId)?.push(notif);
    });
    return Array.from(grouped.values()).map((group) => group[0]); // Take first notification of each group
  }, [notifications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter-tight">Loading flagged content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-inter-tight mb-3">{error}</p>
          <button
            onClick={() => dispatch(fetchFlaggedNotifications())}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
          <Flag className="h-8 w-8 text-red-600" />
          Flagged Content
        </h1>
        <p className="text-gray-600 font-inter-tight mt-1">
          Review and moderate flagged posts - {groupedNotifications.length} item
          {groupedNotifications.length !== 1 ? 's' : ''} pending
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-linear-to-r from-red-500 to-red-600 rounded-lg shadow-md p-5 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 font-inter-tight">Critical Flags</p>
            <p className="text-3xl font-bold font-manrope">{groupedNotifications.length}</p>
          </div>
          <AlertTriangle className="h-12 w-12 opacity-80" />
        </div>
      </div>

      {/* Flagged Content List */}
      {groupedNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 font-manrope mb-2">
            All Clear!
          </h3>
          <p className="text-gray-600 font-inter-tight">
            No flagged content to review at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedNotifications.map((notification) => {
            const isProcessing = localProcessingId === notification.id;
            const hasValidMetadata = notification.metadata.groupId && notification.metadata.postId;

            return (
              <div
                key={notification.id}
                className="bg-white rounded-lg shadow-md border-l-4 border-red-500 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Validation Warning */}
                {!hasValidMetadata && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800 font-inter-tight">
                        Warning: This notification has incomplete metadata.
                        {!notification.metadata.groupId && ' Missing groupId.'}
                        {!notification.metadata.postId && ' Missing postId.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {notification.metadata.profileImageUrl ? (
                      <img
                        src={notification.metadata.profileImageUrl}
                        alt={notification.metadata.senderName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {notification.metadata.senderName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 font-manrope">
                          {notification.metadata.senderName || 'Unknown User'}
                        </p>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          CRITICAL
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-inter-tight">
                        @{notification.metadata.username || 'unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-inter-tight">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>
                </div>

                {/* Group Info */}
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium font-inter-tight">
                    {notification.metadata.groupName || 'Unknown Group'}
                  </span>
                </div>

                {/* Flagged Message */}
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-red-600 mt-1 shrink-0" />
                    <p className="text-sm font-medium text-red-900 font-inter-tight">
                      Self-Harm Detected
                    </p>
                  </div>
                  <p className="text-sm text-gray-800 font-inter-tight leading-relaxed pl-6">
                    {notification.metadata.messageContent || 'No message content available'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(notification)}
                    disabled={isProcessing || !hasValidMetadata}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-manrope"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDelete(notification)}
                    disabled={isProcessing || !hasValidMetadata}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-manrope"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
