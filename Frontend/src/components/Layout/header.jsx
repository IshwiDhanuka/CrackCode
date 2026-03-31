import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code } from 'lucide-react';

const Header = ({ toggleSidebar, isSidebarCollapsed }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Simulate auth: get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const logout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Remove internal logoMargin logic

  return (
    <header className="bg-surface border-b border-white/5 z-50 w-full">
      <div className="w-full py-3">
        <div className="flex justify-between items-center w-full">
          {/* Left: CrackCode logo after sidebar */}
          <div className="flex-1 flex items-center transition-all duration-300">
            <Link to="/" className="flex items-center space-x-2 group">
              <Code className="h-6 w-6 text-primary-container animate-neon" />
              <span className="font-extrabold text-primary-container text-lg tracking-tight">CrackCode</span>
            </Link>
          </div>

          {/* Center: Empty for spacing */}
          <div className="flex-1"></div>

          {/* Right: Auth Links (show only if not logged in) */}
          <div className="flex-1 flex justify-end pr-4">
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                  <span className="text-on-surface-variant text-sm font-semibold">Hi, {user.username}</span>
                    <button
                      onClick={logout}
                    className="px-4 py-1.5 text-sm rounded-md border border-primary-container text-primary-container hover:bg-primary-container hover:text-surface transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                  <Link to="/login" className="px-4 py-1.5 text-sm font-medium border border-white/10 text-on-surface-variant hover:text-white hover:border-white/20 transition-all rounded-lg">Login</Link>
                  <Link to="/register" className="px-4 py-1.5 text-sm font-bold bg-primary-container text-surface hover:scale-105 transition-all rounded-lg">Sign Up</Link>
                  </>
                )}
              </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 bg-gray-900 rounded-lg shadow-md p-4 space-y-2">
            <Link to="/" onClick={toggleMenu} className="block text-gray-300 hover:text-cyan-400">Home</Link>
            <Link to="/problems" onClick={toggleMenu} className="block text-gray-300 hover:text-cyan-400">Problems</Link>
            <Link to="/contest" onClick={toggleMenu} className="block text-gray-300 hover:text-cyan-400">Contests</Link>
            <Link to="/leaderboard" onClick={toggleMenu} className="block text-gray-300 hover:text-cyan-400">Leaderboard</Link>
            <div className="border-t border-gray-700 pt-3">
              {user ? (
                  <>
                    <span className="block text-sm text-gray-400 mb-2">Hi, {user.username}</span>
                    <button
                      onClick={() => {
                        logout();
                        toggleMenu();
                      }}
                      className="w-full px-3 py-2 text-sm border border-cyan-500 text-cyan-400 rounded-md hover:bg-cyan-500 hover:text-black transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={toggleMenu}
                      className="block w-full px-3 py-2 text-sm text-cyan-400 border border-cyan-500 rounded-md text-center hover:bg-cyan-500 hover:text-black transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={toggleMenu}
                      className="block w-full px-3 py-2 mt-2 text-sm bg-cyan-500 text-black rounded-md text-center hover:bg-cyan-400 transition"
                    >
                      Sign Up
                    </Link>
                  </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
