import { Link } from 'react-router-dom';
import '../pages/solve-neon.css';

export default function Contests() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center">
        <div className="mb-8 w-full rounded-2xl bg-white/10 backdrop-blur-md border border-orange-400/30 shadow-xl flex flex-col items-center py-10 px-4 md:px-10" style={{boxShadow: '0 4px 32px 0 #facc1580, 0 0 0 2px #facc1522', background: 'rgba(255,255,255,0.07)'}}>
          <span className="px-4 py-1 rounded-full bg-red-900/80 text-red-200 font-semibold text-base tracking-wide shadow-lg animate-pulse mb-4">
            🚧 Under Construction
          </span>
          <h1 className="text-6xl font-extrabold text-center mb-2 bg-gradient-to-r from-orange-400 via-yellow-300 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_32px_#facc15]">
            404
          </h1>
          <h2 className="text-3xl font-extrabold text-white mb-2">Under Development</h2>
          <p className="text-gray-300 text-lg mb-6 max-w-md text-center">
            The page you're looking for doesn't exist or is currently being built. Our team is working hard to bring you new features!
          </p>
          <div className="flex gap-4">
            <Link to="/" className="px-6 py-2 text-base rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform">
              Return Home
            </Link>
            <Link to="/problems" className="px-6 py-2 text-base rounded-full border-2 border-orange-400 text-orange-300 font-semibold shadow-lg hover:bg-orange-900/20 transition-colors">
              Explore Problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 