import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle, Edit, Trash2, Plus, Code2 } from 'lucide-react';
import ProblemForm from '../components/Admin/ProblemForm';

const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin';
};
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const difficultyColor = {
  Easy:   '#4ade80',
  Medium: '#facc15',
  Hard:   '#f87171',
};

const CYAN   = '#38bdf8';
const BORDER = 'rgba(56,189,248,0.12)';
const BORDER_SUB = 'rgba(56,189,248,0.07)';
const BG_ROW_HOVER = 'rgba(56,189,248,0.04)';

const AdminProblems = () => {
  const [problems, setProblems]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editProblem, setEditProblem] = useState(null);
  const [hoveredRow, setHoveredRow]   = useState(null);

  useEffect(() => { fetchProblems(); }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/problems/`);
      setProblems(res.data.problems || []);
    } catch {
      toast.error('Failed to fetch problems');
    }
    setLoading(false);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/api/problems/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Problem deleted');
      fetchProblems();
    } catch {
      toast.error('Failed to delete problem');
    }
  };

  const handleEdit = async (slug) => {
    try {
      const res = await axios.get(`${backendUrl}/api/problems/${slug}`);
      setEditProblem({ ...res.data.problem, testcases: res.data.testcases || [] });
      setShowForm(true);
    } catch {
      toast.error('Failed to fetch problem details');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold"
        style={{ background: '#020617', color: CYAN }}>
        Admin access only
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: '#020617' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(56,189,248,0.05) 100%)',
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 0 18px rgba(56,189,248,0.12)',
                }}>
                <Code2 size={15} color={CYAN} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Admin <span style={{ color: 'rgba(255,255,255,0.25)' }}>/ Problems</span>
              </h1>
            </div>
            <p className="font-mono text-[12px] ml-12" style={{ color: 'rgba(56,189,248,0.45)' }}>
              // {problems.length} problems in database
            </p>
          </div>

          <button
            onClick={() => { setEditProblem(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
              color: '#000',
              boxShadow: '0 0 20px rgba(56,189,248,0.3)',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(56,189,248,0.5)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(56,189,248,0.3)'}
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Problem
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)', boxShadow: '0 0 40px rgba(56,189,248,0.04)' }}>

          {/* Header row */}
          <div className="grid items-center px-6 py-4 min-w-[700px]"
            style={{
              gridTemplateColumns: '50px 1fr 200px 120px 100px',
              borderBottom: `1px solid ${BORDER}`,
              background: 'rgba(56,189,248,0.03)',
            }}>
            {['Status', 'Title', 'Slug', 'Difficulty', 'Actions'].map((h, i) => (
              <div key={i} className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(56,189,248,0.35)' }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center font-mono text-sm" style={{ color: 'rgba(56,189,248,0.3)' }}>
              // loading problems...
            </div>
          ) : problems.length === 0 ? (
            <div className="py-16 text-center font-mono text-sm" style={{ color: 'rgba(56,189,248,0.2)' }}>
              // no problems found
            </div>
          ) : problems.map((p, i) => {
            const isHovered = hoveredRow === i;
            const dColor = difficultyColor[p.difficulty] || '#fff';
            return (
              <div key={p.slug}
                className="grid items-center px-6 py-4 transition-all duration-200 min-w-[700px]"
                style={{
                  gridTemplateColumns: '50px 1fr 200px 120px 100px',
                  borderBottom: i === problems.length - 1 ? 'none' : `1px solid ${BORDER_SUB}`,
                  background: isHovered ? BG_ROW_HOVER : 'transparent',
                  borderLeft: isHovered ? `2px solid ${CYAN}` : '2px solid transparent',
                }}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Status */}
                <div>
                  {p.solved
                    ? <CheckCircle size={17} color="#4ade80" />
                    : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>—</span>}
                </div>

                {/* Title */}
                <div className="font-bold text-[14px] pr-4" style={{ color: isHovered ? '#fff' : 'rgba(255,255,255,0.85)' }}>
                  {p.title}
                </div>

                {/* Slug */}
                <div className="font-mono text-xs pr-4" style={{ color: 'rgba(56,189,248,0.4)' }}>
                  {p.slug}
                </div>

                {/* Difficulty */}
                <div>
                  <span className="text-xs font-bold font-mono px-3 py-1.5 rounded-lg"
                    style={{
                      color: dColor,
                      background: `${dColor}14`,
                      border: `1px solid ${dColor}40`,
                    }}>
                    {p.difficulty}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(p.slug)}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ border: `1px solid ${BORDER}`, color: CYAN, background: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(56,189,248,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                    title="Edit"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.slug)}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(248,113,113,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {showForm && (
          <ProblemForm
            problem={editProblem}
            onClose={() => setShowForm(false)}
            onSaved={fetchProblems}
          />
        )}
      </div>
    </div>
  );
};

export default AdminProblems;