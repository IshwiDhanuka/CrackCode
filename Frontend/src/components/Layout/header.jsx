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
    <header className="bg-black border-b border-gray-800 shadow-md z-50 w-full">
      <div className="w-full py-3">
        <div className="flex justify-between items-center w-full">
          {/* Left: CrackCode logo after sidebar */}
          <div className="flex-1 flex items-center transition-all duration-300">
            <Link to="/" className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-cyan-400 drop-shadow-neon-cyan animate-neon-glow" />
              <span className="font-extrabold text-cyan-400 text-lg drop-shadow-neon-cyan animate-neon-glow" style={{textShadow: '0 0 8px #22d3ee, 0 0 16px #22d3ee'}}>CrackCode</span>
            </Link>
          </div>

          {/* Center: Empty for spacing */}
          <div className="flex-1"></div>

          {/* Right: Auth Links (show only if not logged in) */}
          <div className="flex-1 flex justify-end pr-4">
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                  <span className="text-cyan-300 text-sm font-semibold">Hi, {user.username}</span>
                    <button
                      onClick={logout}
                    className="px-4 py-1.5 text-sm rounded-md border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition shadow-neon-cyan"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                  <Link to="/login" className="px-4 py-1.5 text-sm rounded-md border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition shadow-neon-cyan">Login</Link>
                  <Link to="/register" className="px-4 py-1.5 text-sm rounded-md bg-cyan-500 text-black hover:bg-cyan-400 transition shadow-neon-cyan">Sign Up</Link>
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
