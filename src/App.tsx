import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import SignIn from "./pages/SignIn";
import { SearchProvider } from "./context/SearchContext";

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <Users />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-custom-page-gradient flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-manrope">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign in page if user is not authenticated
  if (!user) {
    return <SignIn />;
  }

  // Show main app if user is authenticated
  return (
    <SearchProvider>
      <div className="min-h-screen  w-full bg-custom-page-gradient text-gray-800 font-manrope overflow-hidden">
        <div className="h-screen flex">
          <Sidebar
            onNavigate={handleNavigation}
            currentPage={currentPage}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 overflow-auto bg-gray-50/30">
              {renderCurrentPage()}
            </main>
          </div>
        </div>
      </div>
    </SearchProvider>
  );
}

export default App;
