// src/pages/Problems.jsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout/layout';
import { CheckCircle, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const topics = ['All Topics', 'Array', 'Linked List', 'String', 'Hash Table', 'Math'];

const backendUrl = import.meta.env.VITE_BACKEND_URL;


const getColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'text-green-400';
    case 'Medium': return 'text-yellow-400';
    case 'Hard': return 'text-red-400';
    default: return 'text-gray-300';
  }
};

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const navigate = useNavigate();
  const socket = io(backendUrl); 

  // Fetch problems from backend
  const fetchProblems = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/problems/`);
      const data = await res.json();
      setProblems(data.problems || []);
    } catch (err) {
      toast.error('Failed to fetch problems');
    }
  };

  useEffect(() => {
    fetchProblems();
    // WebSocket connection
    const socket = io(backendUrl);
    socket.on('problemAdded', () => {
      fetchProblems();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter problems by search and topic
  const filteredProblems = problems.filter(p => {
    const matchesTopic = selectedTopic === 'All Topics' || p.topic === selectedTopic;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  // Admin manage button handler
  const handleManageClick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
      navigate('/adminproblems');
    } else {
      toast.error('Unauthorized: Admins only');
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto">
            {/* Manage Button inline with Problems List heading */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-cyan-400">Problems List</h1>
              <button
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-1 rounded-md shadow transition text-sm ml-4"
                style={{ minWidth: '80px' }}
                onClick={handleManageClick}
              >
                Manage
              </button>
            </div>
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 gap-2">
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full md:w-72 px-4 py-2 bg-[#18181a] border border-cyan-500/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                {topics.map(topic => (
                  <button
                    key={topic}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition ${selectedTopic === topic ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-[#23272f] text-cyan-300 border-cyan-700 hover:bg-cyan-900'}`}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            {/* Problems Table */}
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[700px] bg-[#111] rounded-lg overflow-hidden border border-gray-800">
                <div className="grid grid-cols-7 py-3 px-4 bg-[#1c1c1c] text-sm font-semibold text-gray-400">
                  <div>Status</div>
                  <div className="col-span-2">Title</div>
                  <div>Difficulty</div>
                  <div>Points</div>
                  <div>Solved %</div>
                  <div>Action</div>
                </div>
                {filteredProblems.map((p, i) => (
                  <div key={p.slug || p.id || i} className="grid grid-cols-7 items-center py-3 px-4 border-t border-gray-800 hover:bg-[#1a1a1a] transition">
                    <div>{p.solved ? <CheckCircle size={20} className="text-green-400" /> : <Circle size={20} className="text-gray-500" />}</div>
                    <div className="col-span-2">
                      <span className="text-cyan-300">{i + 1}. {p.title}</span>
                    </div>
                    <div className={getColor(p.difficulty)}>{p.difficulty}</div>
                    <div className="text-cyan-200 font-semibold text-center">
                      {p.difficulty === 'Easy' ? 10 : p.difficulty === 'Medium' ? 20 : p.difficulty === 'Hard' ? 30 : '--'}
                    </div>
                    <div className="text-sm text-gray-400">{typeof p.percentage === 'number' ? p.percentage.toFixed(1) + '%' : '--'}</div>
                    <div>
                      <button className="text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500 px-3 py-1 rounded" onClick={() => navigate(`/solve/${p.slug}`)}>Solve</button>
                    </div>
                  </div>
                ))}
                {filteredProblems.length === 0 && (
                  <div className="py-8 text-center text-gray-500">No problems found.</div>
                )}
              </div>
            </div>
          </div>
    </Layout>
  );
};

export default Problems;
