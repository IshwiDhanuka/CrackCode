import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Code,
  BookOpen,
  Trophy,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Code, label: 'Problems', path: '/problems' },
    { icon: BookOpen, label: 'Learning', path: '/learning' },
    { icon: Trophy, label: 'Contests', path: '/contests' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`h-screen transition-all duration-300 fixed top-0 left-0 z-50 bg-[#0d0d0d] border-r border-cyan-500/20 shadow-xl text-white
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-cyan-500/10">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-cyan-400" />
            <span className="font-bold text-cyan-400 text-lg">CrackCode</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-cyan-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-6 space-y-1 px-2">
        {menuItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center px-3 py-2 transition-all duration-200 hover:bg-cyan-800/20 rounded-md ${
                isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
