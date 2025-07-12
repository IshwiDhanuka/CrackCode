import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const defaultProblem = {
  title: '',
  slug: '',
  description: '',
  difficulty: 'Easy',
  tags: '',
  constraints: '',
  examples: '',
  testcases: []
};

const difficulties = ['Easy', 'Medium', 'Hard'];

export default function ProblemForm({ problem, onClose, onSaved }) {
  const [form, setForm] = useState(problem || defaultProblem);
  const [saving, setSaving] = useState(false);
  const [tcInput, setTcInput] = useState('');
  const [tcOutput, setTcOutput] = useState('');
  const [tcSample, setTcSample] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTestCase = () => {
    if (!tcInput.trim() || !tcOutput.trim()) return;
    setForm({
      ...form,
      testcases: [...form.testcases, { input: tcInput, expectedOutput: tcOutput, isSample: false }]
    });
    setTcInput('');
    setTcOutput('');
    setTcSample(false);
  };

  const removeTestCase = idx => {
    setForm({
      ...form,
      testcases: form.testcases.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/problems/', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()),
        examples: [
          { input: "sample input", output: "sample output", explanation: "sample explanation" }
        ],
        testcases: form.testcases
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Problem created!');
      onSaved && onSaved();
      onClose && onClose();
      navigate('/problems');
    } catch (err) {
      toast.error('Failed to create problem');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <form onSubmit={handleSubmit} className="bg-[#18181a] rounded-xl p-8 w-full max-w-2xl border border-cyan-500/30 shadow-2xl relative">
        <button type="button" className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-200 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Create Problem</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" required />
          <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (unique)" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" required />
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white">
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" />
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full mb-3 px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" rows={3} />
        <textarea name="constraints" value={form.constraints} onChange={handleChange} placeholder="Constraints" className="w-full mb-3 px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" rows={2} />
        <textarea name="examples" value={form.examples} onChange={handleChange} placeholder="Examples" className="w-full mb-3 px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" rows={2} />
        <div className="mb-4">
          <h3 className="text-cyan-300 font-semibold mb-2">Test Cases</h3>
          <div className="flex gap-2 mb-2">
            <input value={tcInput} onChange={e => setTcInput(e.target.value)} placeholder="Input" className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-white flex-1" />
            <input value={tcOutput} onChange={e => setTcOutput(e.target.value)} placeholder="Expected Output" className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-white flex-1" />
            <button type="button" onClick={addTestCase} className="px-3 py-1 rounded bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition">Add</button>
          </div>
          <div className="space-y-1">
            {form.testcases.map((tc, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#23272f] border border-cyan-700 rounded px-2 py-1">
                <span className="text-xs text-gray-400">Hidden</span>
                <span className="text-xs text-cyan-300">Input:</span> <span className="text-xs">{tc.input}</span>
                <span className="text-xs text-cyan-300">Output:</span> <span className="text-xs">{tc.expectedOutput}</span>
                <button type="button" onClick={() => removeTestCase(idx)} className="ml-auto text-red-400 hover:text-red-200">Remove</button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full py-2 bg-cyan-500 text-black font-bold rounded-md hover:bg-cyan-400 transition shadow-md" disabled={saving}>
          {saving ? 'Saving...' : 'Create Problem'}
        </button>
      </form>
    </div>
  );
} 