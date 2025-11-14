import Feedback from '../components/Feedback';

export default function Dashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-david-libre font-bold text-gray-800">User Feedback</h1>
        <p className="text-gray-600 font-inter-tight mt-1">
          User feedback and suggestions from the users
        </p>
      </div>

      {/* Feedback Section */}
      <Feedback />
    </div>
  );
}
