import { useEffect, useState, useMemo } from 'react';
import { MessageSquare, Star, User, Mail, Calendar } from 'lucide-react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Pagination from './Pagination';

interface FeedbackItem {
  id: string;
  message: string;
  feedbackType: string;
  rating: number;
  createdAt: Timestamp;
}

interface FeedbackDocument {
  userEmail: string;
  userName?: string;
  feedbacks: FeedbackItem[];
}

interface DisplayFeedback extends FeedbackItem {
  userEmail: string;
  userName?: string;
  docId: string;
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState<DisplayFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      const feedbackRef = collection(db, 'feedback');
      const querySnapshot = await getDocs(feedbackRef);

      const allFeedbacks: DisplayFeedback[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FeedbackDocument;
        const userEmail = data.userEmail || 'Unknown';
        const userName = data.userName;

        // Extract feedbacks array from each document
        if (data.feedbacks && Array.isArray(data.feedbacks)) {
          data.feedbacks.forEach((feedback, index) => {
            allFeedbacks.push({
              id: `${doc.id}_${index}`,
              docId: doc.id,
              message: feedback.message || '',
              feedbackType: feedback.feedbackType || 'General',
              rating: feedback.rating || 0,
              createdAt: feedback.createdAt,
              userEmail: userEmail,
              userName: userName,
            });
          });
        }
      });

      // Sort by createdAt (newest first)
      allFeedbacks.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

      setFeedbacks(allFeedbacks);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return feedbacks.slice(startIndex, endIndex);
  }, [feedbacks, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'a suggestion':
        return 'bg-blue-100 text-blue-800';
      case 'a problem or bug':
        return 'bg-red-100 text-red-800';
      case 'a compliment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600 font-inter-tight">Loading feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-center h-40">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-600 font-inter-tight mb-3">{error}</p>
            <button
              onClick={fetchFeedback}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 font-manrope flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            User Feedback
          </h2>
          <p className="text-sm text-gray-600 font-inter-tight mt-1">
            {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} received
          </p>
        </div>
      </div>

      {/* Feedback List */}
      <div className="divide-y divide-gray-200">
        {feedbacks.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-inter-tight">No feedback available</p>
          </div>
        ) : (
          paginatedFeedbacks.map((feedback) => (
            <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
              {/* Feedback Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 font-manrope truncate">
                        {feedback.userName || 'Anonymous User'}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-inter-tight ${getTypeColor(
                          feedback.feedbackType
                        )}`}
                      >
                        {feedback.feedbackType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-inter-tight">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{feedback.userEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Rating and Date */}
                <div className="flex items-center gap-4 shrink-0">
                  {renderStars(feedback.rating)}
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-inter-tight">
                    <Calendar className="h-3 w-3" />
                    <span className="hidden sm:inline">{formatDate(feedback.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              <div className="ml-0 sm:ml-13">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-800 font-inter-tight leading-relaxed">
                    {feedback.message}
                  </p>
                </div>
              </div>

              {/* Mobile Date */}
              <div className="sm:hidden mt-3 flex items-center gap-1 text-xs text-gray-500 font-inter-tight">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(feedback.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {feedbacks.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={feedbacks.length}
        />
      )}
    </div>
  );
}
