import { RefreshCw } from 'lucide-react';
import Feedback from '../components/Feedback';

export default function Dashboard() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-david-libre font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 font-inter-tight mt-1">
            Welcome to MySunlight Admin Panel
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-manrope"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Feedback Section */}
      <Feedback />
    </div>
  );
}