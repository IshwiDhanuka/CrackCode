import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle, Edit, Trash2, Plus } from 'lucide-react';
import ProblemForm from '../components/Admin/ProblemForm';

// Mock admin check (replace with real auth check)
const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin';
};

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProblem, setEditProblem] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/problems/');
      setProblems(res.data.problems || []);
    } catch (err) {
      toast.error('Failed to fetch problems');
    }
    setLoading(false);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/problems/${slug}`);
      toast.success('Problem deleted');
      fetchProblems();
    } catch (err) {
      toast.error('Failed to delete problem');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-cyan-400 text-xl font-bold">
        Admin access only
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-400">Admin: Manage Problems</h1>
          <button
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-md shadow transition"
            onClick={() => { setEditProblem(null); setShowForm(true); }}
          >
            <Plus size={18} /> Create Problem
          </button>
        </div>
        <div className="bg-[#111] rounded-lg overflow-x-auto border border-gray-800">
          <div className="grid grid-cols-6 py-3 px-4 bg-[#1c1c1c] text-sm font-semibold text-gray-400 min-w-[700px]">
            <div>Status</div>
            <div>Title</div>
            <div>Slug</div>
            <div>Difficulty</div>
            <div>Actions</div>
            <div></div>
          </div>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : problems.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No problems found.</div>
          ) : problems.map((p, i) => (
            <div key={p.slug} className="grid grid-cols-6 items-center py-3 px-4 border-t border-gray-800 hover:bg-[#1a1a1a] transition min-w-[700px]">
              <div>{p.solved ? <CheckCircle size={20} className="text-green-400" /> : <span className="text-gray-500">-</span>}</div>
              <div className="text-cyan-300 font-medium">{p.title}</div>
              <div className="text-gray-400">{p.slug}</div>
              <div className={
                p.difficulty === 'Easy' ? 'text-green-400' :
                p.difficulty === 'Medium' ? 'text-yellow-400' :
                p.difficulty === 'Hard' ? 'text-red-400' : 'text-gray-300'
              }>{p.difficulty}</div>
              <div className="flex gap-2">
                <button
                  className="p-1 rounded hover:bg-cyan-900"
                  onClick={() => { setEditProblem(p); setShowForm(true); }}
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  className="p-1 rounded hover:bg-red-900"
                  onClick={() => handleDelete(p.slug)}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div></div>
            </div>
          ))}
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