import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Code } from 'lucide-react';
//import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  //const { user, logout } = useAuth();

  const user = null;
  const logout = () => console.log("Logging out...");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-black border-b border-gray-800 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Code className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_5px_#0ff]" />
            <span className="text-xl font-bold text-cyan-300 tracking-wider">CrackCode</span>
          </Link>


          {/* Right-side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-400 text-sm">Hi, {user.username}</span>
                <button
                  onClick={logout}
                  className="px-4 py-1.5 text-sm rounded-md border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-1.5 text-sm rounded-md border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition">Login</Link>
                <Link to="/register" className="px-4 py-1.5 text-sm rounded-md bg-cyan-500 text-black hover:bg-cyan-400 transition">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={toggleMenu} className="md:hidden text-cyan-400">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
