import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-david-libre font-bold text-gray-800 mb-4">Analytics</h1>
            <p className="text-gray-600">Analytics page coming soon...</p>
          </div>
        );
      case 'users':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-david-libre font-bold text-gray-800 mb-4">Users</h1>
            <p className="text-gray-600">User management page coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-david-libre font-bold text-gray-800 mb-4">Settings</h1>
            <p className="text-gray-600">Settings page coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen  w-full bg-custom-page-gradient text-gray-800 font-manrope overflow-hidden">
      <div className="h-screen flex">
        <Sidebar 
          onNavigate={handleNavigation} 
          currentPage={currentPage}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar currentPage={currentPage} />
          <main className="flex-1 overflow-auto bg-gray-50/30">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
