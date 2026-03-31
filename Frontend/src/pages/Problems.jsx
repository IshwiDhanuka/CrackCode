import { useEffect, useState } from 'react';
import Layout from '../components/Layout/layout';
import { CheckCircle, Circle, Search, SlidersHorizontal, Zap, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const topics = ['All Topics', 'Array', 'Linked List', 'String', 'Hash Table', 'Math'];
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const difficultyConfig = {
  Easy: { textColor: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', glow: 'rgba(74,222,128,0.15)', points: 10 },
  Medium: { textColor: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.25)', glow: 'rgba(250,204,21,0.15)', points: 20 },
  Hard: { textColor: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', glow: 'rgba(248,113,113,0.15)', points: 30 },
};

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [hoveredRow, setHoveredRow] = useState(null);
  const navigate = useNavigate();

  const fetchProblems = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/problems/`);
      const data = await res.json();
      setProblems(data.problems || []);
    } catch {
      toast.error('Failed to fetch problems');
    }
  };

  useEffect(() => {
    fetchProblems();
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
    socket.on('problemAdded', fetchProblems);
    return () => socket.disconnect();
  }, []);

  const filteredProblems = problems.filter(p => {
    const matchesTopic = selectedTopic === 'All Topics' || p.topic === selectedTopic;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const handleManageClick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'admin') navigate('/adminproblems');
    else toast.error('Unauthorized: Admins only');
  };

  const easyCnt = problems.filter(p => p.difficulty === 'Easy').length;
  const medCnt = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCnt = problems.filter(p => p.difficulty === 'Hard').length;

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
                <Code2 size={16} color="#22D3EE" />
              </div>
              <h1 className="text-3xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, #fff 40%, rgba(255,255,255,0.5))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                Problems
              </h1>
            </div>
            <p className="text-white/30 text-xs font-mono ml-11">
              {filteredProblems.length} challenges available
            </p>
          </div>
          <button
            onClick={handleManageClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={{ border: '1px solid rgba(34,211,238,0.2)', color: '#22D3EE', background: 'rgba(34,211,238,0.05)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,211,238,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,211,238,0.05)'}
          >
            <SlidersHorizontal size={13} />
            Manage
          </button>
        </div>

        {/* Stats Pills */}
        <div className="flex gap-3 mb-7">
          {[
            { label: 'Easy', count: easyCnt, ...difficultyConfig.Easy },
            { label: 'Medium', count: medCnt, ...difficultyConfig.Medium },
            { label: 'Hard', count: hardCnt, ...difficultyConfig.Hard },
          ].map(({ label, count, textColor, bg, border }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: bg, border: `1px solid ${border}`, color: textColor }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: textColor }} />
              {count} {label}
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <input
              type="text"
              placeholder="Search problems..."
              className="w-full md:w-64 pl-9 pr-4 py-2.5 text-sm text-white transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', outline: 'none' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <button key={topic} onClick={() => setSelectedTopic(topic)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: selectedTopic === topic ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',
                  border: selectedTopic === topic ? '1px solid rgba(34,211,238,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  color: selectedTopic === topic ? '#22D3EE' : 'rgba(255,255,255,0.35)',
                }}>
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Header row */}
          <div className="grid items-center px-5 py-3"
            style={{
              gridTemplateColumns: '36px 1fr 120px 80px 90px 100px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)'
            }}>
            {['', 'Title', 'Difficulty', 'Points', 'Solved %', 'Action'].map((h, i) => (
              <div key={i} className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.2)' }}>{h}</div>
            ))}
          </div>

          {filteredProblems.length === 0 ? (
            <div className="py-20 text-center font-mono text-sm" style={{ color: 'rgba(255,255,255,0.15)' }}>
              // no problems found
            </div>
          ) : (
            filteredProblems.map((p, i) => {
              const cfg = difficultyConfig[p.difficulty] || {};
              const isHovered = hoveredRow === i;
              return (
                <div key={p.slug || i}
                  className="grid items-center px-5 py-4 cursor-pointer transition-all duration-200"
                  style={{
                    gridTemplateColumns: '36px 1fr 120px 80px 90px 100px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isHovered ? 'rgba(34,211,238,0.03)' : 'transparent',
                    borderLeft: isHovered ? '2px solid rgba(34,211,238,0.3)' : '2px solid transparent',
                  }}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => navigate(`/solve/${p.slug}`)}>

                  <div>
                    {p.solved
                      ? <CheckCircle size={15} color="#4ade80" />
                      : <Circle size={15} style={{ color: isHovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }} />}
                  </div>

                  <div className="pr-4 flex items-center gap-2.5">
                    <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span className="text-sm font-medium transition-colors duration-200"
                      style={{ color: isHovered ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                      {p.title}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{
                        background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.textColor,
                        boxShadow: isHovered ? `0 0 10px ${cfg.glow}` : 'none'
                      }}>
                      {p.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Zap size={11} style={{ color: cfg.textColor }} />
                    <span className="text-sm font-bold font-mono" style={{ color: cfg.textColor }}>+{cfg.points}</span>
                  </div>

                  <div className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {typeof p.percentage === 'number' ? p.percentage.toFixed(1) + '%' : '—'}
                  </div>

                  <div onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/solve/${p.slug}`)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200"
                      style={{
                        background: isHovered ? 'rgba(34,211,238,0.15)' : 'rgba(34,211,238,0.06)',
                        border: `1px solid ${isHovered ? 'rgba(34,211,238,0.5)' : 'rgba(34,211,238,0.2)'}`,
                        color: '#22D3EE',
                        boxShadow: isHovered ? '0 0 14px rgba(34,211,238,0.2)' : 'none',
                      }}>
                      Solve →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredProblems.length > 0 && (
          <p className="text-center font-mono text-xs mt-5" style={{ color: 'rgba(255,255,255,0.12)' }}>
            // showing {filteredProblems.length} of {problems.length} problems
          </p>
        )}
      </div>
    </Layout>
  );
};

export default Problems;