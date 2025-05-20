import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import VolumeDashboard from "./pages/VolumeDashboard";
import WalletAnalysisDashboard from "./pages/WalletAnalysisDashboard";
import { ThemeProvider } from "./context/themeContext";
import "./index.css"; // Tailwind and global CSS

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex space-x-8">
                  <Link
                    to="/volume"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    USD Volume Dashboard
                  </Link>
                  <Link
                    to="/wallet-analysis"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Wallet Analysis
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/volume" element={<VolumeDashboard />} />
              <Route path="/wallet-analysis/:address?" element={<WalletAnalysisDashboard />} />
              <Route
                path="/"
                element={
                  <Navigate
                    to="/wallet-analysis/0xdab58cb37cd9cc7fdcedae28e8d6c2f7b14e35fd"
                    replace
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
