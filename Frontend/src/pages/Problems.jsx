import { useEffect, useState } from 'react';
import Layout from '../components/Layout/layout';
import { CheckCircle, Circle, Search, SlidersHorizontal, Zap, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const topics = ['All Topics', 'Array', 'Linked List', 'String', 'Hash Table', 'Math'];
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const difficultyConfig = {
  Easy: { textColor: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)' },
  Medium: { textColor: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.25)' },
  Hard: { textColor: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
};

// Matches the homepage deep navy
const BG_CARD   = 'rgba(255,255,255,0.03)';
const BG_HOVER  = 'rgba(56,189,248,0.04)';
const BORDER    = 'rgba(56,189,248,0.12)';
const BORDER_SUB = 'rgba(56,189,248,0.07)';
const CYAN      = '#38bdf8';
const CYAN_DIM  = 'rgba(56,189,248,0.15)';

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
  const medCnt  = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCnt = problems.filter(p => p.difficulty === 'Hard').length;

  const solvedCnt = problems.filter(p => p.solved).length;
  const totalCnt  = problems.length;

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              {/* Icon box — cyan border glow matching homepage card style */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(56,189,248,0.05) 100%)',
                  border: `1px solid ${BORDER}`,
                  boxShadow: `0 0 18px rgba(56,189,248,0.12)`,
                }}
              >
                <Code2 size={16} color={CYAN} />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                Probl<span style={{ color: 'rgba(255,255,255,0.25)' }}>ems</span>
              </h1>
            </div>
            <p className="text-[13px] font-mono ml-14" style={{ color: 'rgba(56,189,248,0.45)' }}>
              // {filteredProblems.length} challenges available
            </p>
          </div>

          {/* Manage — outlined cyan, matches homepage "VIEW CONTESTS" button */}
          <button
            onClick={handleManageClick}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 mt-1"
            style={{
              border: `1px solid ${BORDER}`,
              color: CYAN,
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = CYAN_DIM;
              e.currentTarget.style.boxShadow = `0 0 14px rgba(56,189,248,0.2)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Zap size={14} />
            Manage
          </button>
        </div>

        {/* Stats Pills */}
        <div className="flex gap-3 mb-8">
          {[
            { label: 'Easy',   count: easyCnt, ...difficultyConfig.Easy },
            { label: 'Medium', count: medCnt,  ...difficultyConfig.Medium },
            { label: 'Hard',   count: hardCnt, ...difficultyConfig.Hard },
          ].map(({ label, count, textColor, bg, border }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wide"
              style={{ background: bg, border: `1px solid ${border}`, color: textColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: textColor }} />
              {count} {label}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {totalCnt > 0 && (
          <div className="mb-10 lg:w-[480px]">
            <div className="flex justify-between text-[11px] font-mono tracking-widest uppercase mb-3">
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>SOLVED PROGRESS</span>
              <span style={{ color: CYAN }}>
                {solvedCnt} / {totalCnt}{' '}
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>solved</span>
              </span>
            </div>
            {/* Track has a faint cyan tint */}
            <div
              className="w-full h-1.5 rounded-full overflow-hidden flex gap-0.5"
              style={{ background: 'rgba(56,189,248,0.08)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${totalCnt ? (easyCnt / totalCnt) * 100 : 0}%`, background: difficultyConfig.Easy.textColor }}
              />
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${totalCnt ? (medCnt / totalCnt) * 100 : 0}%`, background: difficultyConfig.Medium.textColor }}
              />
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${totalCnt ? (hardCnt / totalCnt) * 100 : 0}%`, background: difficultyConfig.Hard.textColor }}
              />
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(56,189,248,0.4)' }} />
            <input
              type="text"
              placeholder="Search problems..."
              className="w-full lg:w-72 pl-10 pr-4 py-2.5 font-mono text-sm text-white transition-all duration-200"
              style={{
                background: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
                outline: 'none',
              }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = CYAN;
                e.target.style.boxShadow = `0 0 0 2px rgba(56,189,248,0.12)`;
              }}
              onBlur={e => {
                e.target.style.borderColor = BORDER;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {topics.map(topic => {
              const active = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className="px-4 py-2 rounded-lg text-sm font-bold font-mono transition-all duration-200"
                  style={{
                    /* Active: cyan-filled like homepage "Start Coding" */
                    background: active
                      ? 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'
                      : BG_CARD,
                    border: active ? '1px solid transparent' : `1px solid ${BORDER}`,
                    color: active ? '#000' : 'rgba(255,255,255,0.7)',
                    boxShadow: active ? '0 0 16px rgba(56,189,248,0.3)' : 'none',
                  }}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl"
          style={{
            border: `1px solid ${BORDER}`,
            background: BG_CARD,
            boxShadow: '0 0 40px rgba(56,189,248,0.04)',
          }}
        >
          {/* Header row */}
          <div
            className="grid items-center px-6 py-4"
            style={{
              gridTemplateColumns: '40px 1fr 130px 100px 100px 110px',
              borderBottom: `1px solid ${BORDER_SUB}`,
            }}
          >
            {['', 'Title', 'Difficulty', 'Points', 'Solved %', 'Action'].map((h, i) => (
              <div
                key={i}
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(56,189,248,0.35)' }}
              >
                {h}
              </div>
            ))}
          </div>

          {filteredProblems.length === 0 ? (
            <div
              className="py-24 text-center font-mono text-sm"
              style={{ color: 'rgba(56,189,248,0.2)' }}
            >
              // no problems found matching criteria
            </div>
          ) : (
            filteredProblems.map((p, i) => {
              const cfg = difficultyConfig[p.difficulty] || {};
              const isHovered = hoveredRow === i;
              return (
                <div
                  key={p.slug || i}
                  className="grid items-center px-6 py-5 cursor-pointer transition-all duration-200"
                  style={{
                    gridTemplateColumns: '40px 1fr 130px 100px 100px 110px',
                    borderBottom:
                      i === filteredProblems.length - 1
                        ? 'none'
                        : `1px solid ${BORDER_SUB}`,
                    background: isHovered ? BG_HOVER : 'transparent',
                    borderLeft: isHovered ? `2px solid ${CYAN}` : '2px solid transparent',
                  }}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => navigate(`/solve/${p.slug}`)}
                >
                  {/* Solved icon */}
                  <div>
                    {p.solved
                      ? <CheckCircle size={16} color="#4ade80" />
                      : <Circle size={16} style={{ color: isHovered ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.12)' }} />}
                  </div>

                  {/* Title */}
                  <div className="pr-4 flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold" style={{ color: 'rgba(56,189,248,0.3)' }}>
                      #{String(i + 1).padStart(3, '0')}.
                    </span>
                    <span
                      className="text-[15px] font-bold transition-colors duration-200"
                      style={{ color: isHovered ? '#fff' : 'rgba(255,255,255,0.85)' }}
                    >
                      {p.title}
                    </span>
                  </div>

                  {/* Difficulty badge */}
                  <div>
                    <span
                      className="text-xs font-bold font-mono px-3 py-1.5 rounded-lg"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.textColor }}
                    >
                      {p.difficulty}
                    </span>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-1.5 text-[13px] font-bold font-mono" style={{ color: cfg.textColor }}>
                    <Zap size={11} strokeWidth={3} />
                    +{p.points || (p.difficulty === 'Easy' ? 10 : p.difficulty === 'Medium' ? 20 : 30)}
                  </div>

                  {/* Solved % */}
                  <div className="font-mono text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {typeof p.percentage === 'number' ? p.percentage.toFixed(1) + '%' : '—'}
                  </div>

                  {/* Solve button — cyan gradient on hover matching homepage CTA */}
                  <div onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/solve/${p.slug}`)}
                      className="px-5 py-2 w-full flex items-center justify-center gap-2 text-[13px] font-bold rounded-xl transition-all duration-200"
                      style={{
                        background: 'transparent',
                        border: `1px solid ${BORDER}`,
                        color: CYAN,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)';
                        e.currentTarget.style.color = '#000';
                        e.currentTarget.style.border = '1px solid transparent';
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(56,189,248,0.35)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = CYAN;
                        e.currentTarget.style.border = `1px solid ${BORDER}`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Solve
                      <span style={{ fontSize: '10px' }}>➜</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredProblems.length > 0 && (
          <p className="text-center font-mono text-[11px] mt-8" style={{ color: 'rgba(56,189,248,0.25)' }}>
            // showing {filteredProblems.length} of {problems.length} problems
          </p>
        )}
      </div>
    </Layout>
  );
};

export default Problems;