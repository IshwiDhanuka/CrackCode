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
      className={`h-screen transition-all duration-300 fixed top-0 left-0 z-50 bg-[#020617] border-r border-white/5 shadow-2xl text-white
        ${isCollapsed ? 'w-16' : 'w-[260px]'}
      `}
      style={{
        background: 'linear-gradient(180deg, #020617 0%, #030712 100%)'
      }}
    >
      <div className={`flex items-center border-b border-[#38BDF8]/08 h-[72px] ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <Code className="h-6 w-6 text-[#22D3EE] drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
            <span className="font-black text-[#22D3EE] text-xl tracking-tighter">CrackCode</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`text-white/40 hover:text-[#22D3EE] transition-colors p-1 ${isCollapsed ? '' : 'ml-auto'}`}
        >
          {isCollapsed ? <ChevronRight size={22} strokeWidth={1.8} /> : <ChevronLeft size={22} strokeWidth={1.8} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className={`mt-4 flex flex-col px-3 ${isCollapsed ? 'gap-4 items-center' : 'gap-2'}`}>
        {menuItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center transition-all duration-200 group relative overflow-hidden border ${isCollapsed
                ? 'w-12 h-12 justify-center rounded-[14px] px-0'
                : 'px-4 py-3 rounded-[12px]'
                } ${isActive
                  ? 'bg-gradient-to-r from-[#22D3EE]/16 to-[#6366F1]/12 border-[#38BDF8]/25 text-[#22D3EE] shadow-[0_0_16px_rgba(56,189,248,0.25)]'
                  : 'border-transparent text-white/50 hover:bg-[#38BDF8]/08 hover:text-white hover:translate-x-1'
                }`}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                className={`transition-all duration-300 group-hover:scale-[1.08] ${isActive ? 'text-[#22D3EE]' : 'text-white/40 group-hover:text-white'
                  }`}
              />
              {!isCollapsed && (
                <span className={`ml-3 text-[14px] font-medium tracking-[0.2px] transition-colors ${isActive ? 'text-white font-bold' : ''}`}>
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
