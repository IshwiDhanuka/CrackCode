import { Code, Github, Twitter, Mail } from 'lucide-react';

const footer = () => {
  return (
    <footer className="bg-black text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="h-8 w-8 text-cyan-400 drop-shadow-neon" />
              <span className="text-2xl font-bold text-cyan-300 tracking-wide">CrackCode</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
              CrackCode is your one-stop solution to sharpen your DSA skills, solve real-world problems, and rise up the leaderboard. Practice. Compete. Crack it!
            </p>
            <div className="flex space-x-5 mt-4">
              <Github className="h-5 w-5 text-cyan-300 hover:text-white transition-all duration-200 cursor-pointer" />
              <Twitter className="h-5 w-5 text-cyan-300 hover:text-white transition-all duration-200 cursor-pointer" />
              <Mail className="h-5 w-5 text-cyan-300 hover:text-white transition-all duration-200 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-violet-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-violet-300 transition">Home</a></li>
              <li><a href="/problems" className="text-gray-300 hover:text-violet-300 transition">Problems</a></li>
              <li><a href="/contest" className="text-gray-300 hover:text-violet-300 transition">Contests</a></li>
              <li><a href="/leaderboard" className="text-gray-300 hover:text-violet-300 transition">Leaderboard</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-violet-400 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-violet-300 transition">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-violet-300 transition">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-violet-300 transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-violet-300 transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 <span className="text-cyan-400 font-medium">CrackCode</span>. Built with ⚡ and caffeine by passionate devs.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default footer;
