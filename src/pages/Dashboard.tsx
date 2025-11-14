import Feedback from '../components/Feedback';

export default function Dashboard() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-david-libre font-bold text-gray-800">
          User Feedback
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-inter-tight mt-1">
          User feedback and suggestions from the users
        </p>
      </div>

      {/* Feedback Section */}
      <Feedback />
    </div>
  );
}
