import { useState, useEffect } from 'react';
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
  testcases: [],
  functionName: '',
  className: '',
  arguments: '',
  returnType: '',
};

const difficulties = ['Easy', 'Medium', 'Hard'];

export default function ProblemForm({ problem, onClose, onSaved }) {
  const [form, setForm] = useState(problem || defaultProblem);
  const [saving, setSaving] = useState(false);
  const [tcVars, setTcVars] = useState([{ name: '', value: '' }]);
  const [tcOutput, setTcOutput] = useState('');
  const [tcType, setTcType] = useState('Sample');
  const [exampleInput, setExampleInput] = useState('');
  const [exampleOutput, setExampleOutput] = useState('');
  const [exampleExplanation, setExampleExplanation] = useState('');
  const [examples, setExamples] = useState(problem?.examples || []);
  const [ready, setReady] = useState(!problem);
  const navigate = useNavigate();
  const isEdit = !!problem;

  useEffect(() => {
    if (problem && problem.title) {
      setForm({
        ...defaultProblem,
        ...problem,
        testcases: problem.testcases || [],
        tags: Array.isArray(problem.tags) ? problem.tags.join(', ') : (problem.tags || ''),
        functionName: problem.functionName || '',
        className: problem.className || '',
        arguments: problem.arguments || '',
        returnType: problem.returnType || '',
      });
      setExamples(problem.examples || []);
      setReady(true);
    } else {
      setForm(defaultProblem);
      setExamples([]);
      setReady(true);
    }
  }, [problem]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addExample = () => {
    if (!exampleInput.trim() || !exampleOutput.trim()) return;
    setExamples([...examples, { input: exampleInput, output: exampleOutput, explanation: exampleExplanation }]);
    setExampleInput('');
    setExampleOutput('');
    setExampleExplanation('');
  };
  const removeExample = idx => {
    setExamples(examples.filter((_, i) => i !== idx));
  };

  const addTcVar = () => setTcVars([...tcVars, { name: '', value: '' }]);
  const removeTcVar = idx => setTcVars(tcVars.filter((_, i) => i !== idx));
  const handleTcVarChange = (idx, field, val) => {
    setTcVars(tcVars.map((v, i) => i === idx ? { ...v, [field]: val } : v));
  };
  const addTestCase = () => {
    if (!tcVars.every(v => v.name.trim() && v.value.trim()) || !tcOutput.trim()) return;
    // Combine variable/value pairs into a single raw input string (one per line)
    const rawInput = tcVars.map(v => v.value).join('\n');
    setForm({
      ...form,
      testcases: [...form.testcases, { inputs: tcVars.map(v => ({ ...v })), input: rawInput, expectedOutput: tcOutput, isSample: tcType === 'Sample' }]
    });
    setTcVars([{ name: '', value: '' }]);
    setTcOutput('');
    setTcType('Sample');
  };

  const removeTestCase = idx => {
    setForm({
      ...form,
      testcases: form.testcases.filter((_, i) => i !== idx)
    });
  };
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const testcasesForBackend = (form.testcases || [])
        .map(tc => ({
          input: (tc.inputs || []).map(v => `${v.name} = ${v.value}`).join('\n'),
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample
        }))
        .filter(tc => tc.input.trim() !== '');
      if (isEdit) {
        await axios.put(`${backendUrl}/api/problems/${problem.slug}`, {
          ...form,
          tags: form.tags.split(',').map(t => t.trim()),
          examples,
          testcases: testcasesForBackend,
          functionName: form.functionName || '',
          className: form.className || '',
          arguments: form.arguments || '',
          returnType: form.returnType || ''
        }, config);
        toast.success('Problem updated!');
      } else {
      await axios.post(`${backendUrl}/api/problems/`, {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()),
        examples,
        testcases: testcasesForBackend,
        functionName: form.functionName || '',
        className: form.className || '',
        arguments: form.arguments || '',
        returnType: form.returnType || ''
      }, config);
      toast.success('Problem created!');
      }
      onSaved && onSaved();
      onClose && onClose();
      navigate('/problems');
    } catch (err) {
      toast.error(isEdit ? 'Failed to update problem' : 'Failed to create problem');
    }
    setSaving(false);
  };

  if (!ready) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 text-cyan-400 text-xl">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <form onSubmit={handleSubmit} className="bg-[#18181a] rounded-xl p-8 w-full max-w-2xl border border-cyan-500/30 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button type="button" className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-200 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold text-cyan-400 mb-4">{isEdit ? 'Edit Problem' : 'Create Problem'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" required />
          <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (unique)" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" required />
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white">
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" />
          <input name="returnType" value={form.returnType} onChange={handleChange} placeholder="Return Type (e.g. int)" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" required />
          <input name="functionName" value={form.functionName} onChange={handleChange} placeholder="Function Name (e.g. minEatingSpeed)" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" required />
          <input name="className" value={form.className} onChange={handleChange} placeholder="Class Name (optional, e.g. Solution)" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" />
          <input name="arguments" value={form.arguments} onChange={handleChange} placeholder="Arguments (e.g. vector<int>& piles, int h)" className="px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" required />
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full mb-3 px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" rows={3} />
        <textarea name="constraints" value={form.constraints} onChange={handleChange} placeholder="Constraints" className="w-full mb-3 px-3 py-2 rounded bg-[#23272f] border border-cyan-700 text-white" rows={2} />
        {/* Examples Section */}
        <div className="mb-4">
          <h3 className="text-cyan-300 font-semibold mb-2">Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input value={exampleInput} onChange={e => setExampleInput(e.target.value)} placeholder="Input" className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-white w-full" />
            <input value={exampleOutput} onChange={e => setExampleOutput(e.target.value)} placeholder="Output" className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-white w-full" />
            <input value={exampleExplanation} onChange={e => setExampleExplanation(e.target.value)} placeholder="Explanation (optional)" className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-white w-full" />
          </div>
          <button type="button" onClick={addExample} className="px-3 py-1 rounded bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition mb-2">Add Example</button>
          <div className="space-y-1">
            {(examples || []).map((ex, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2 bg-[#23272f] border border-cyan-700 rounded px-2 py-1">
                <span className="text-xs text-cyan-300">Input:</span> <span className="text-xs">{ex.input}</span>
                <span className="text-xs text-green-400">Output:</span> <span className="text-xs">{ex.output}</span>
                {ex.explanation && <span className="text-xs text-gray-400">Explanation: {ex.explanation}</span>}
                <button type="button" onClick={() => removeExample(idx)} className="ml-auto text-red-400 hover:text-red-200">Remove</button>
              </div>
            ))}
          </div>
        </div>
        {/* Test Cases Section */}
        <div className="mb-4">
          <h3 className="text-cyan-300 font-semibold mb-2">Test Cases</h3>
          <div className="space-y-2 mb-2">
            {tcVars.map((v, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input value={v.name} onChange={e => handleTcVarChange(idx, 'name', e.target.value)} placeholder="Variable" className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-white w-24" />
                <input value={v.value} onChange={e => handleTcVarChange(idx, 'value', e.target.value)} placeholder="Value" className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-white flex-1" />
                {tcVars.length > 1 && <button type="button" onClick={() => removeTcVar(idx)} className="text-red-400 hover:text-red-200">Remove</button>}
              </div>
            ))}
            <button type="button" onClick={addTcVar} className="px-2 py-1 rounded bg-cyan-700 text-cyan-100 text-xs font-bold hover:bg-cyan-500 transition">+ Add Variable</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 items-center">
            <input value={tcOutput} onChange={e => setTcOutput(e.target.value)} placeholder="Expected Output" className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-white w-full" />
            <select value={tcType} onChange={e => setTcType(e.target.value)} className="px-2 py-1 rounded bg-[#23272f] border border-cyan-700 text-cyan-300 w-full">
              <option value="Sample">Sample</option>
              <option value="Hidden">Hidden</option>
            </select>
            <button type="button" onClick={addTestCase} className="px-3 py-1 rounded bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition">Add Test Case</button>
          </div>
          <div className="space-y-1">
            {(form.testcases || []).map((tc, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2 bg-[#23272f] border border-cyan-700 rounded px-2 py-1">
                <span className={`text-xs font-bold px-2 py-1 rounded ${tc.isSample ? 'bg-cyan-700 text-cyan-200' : 'bg-pink-900 text-pink-300'}`}>{tc.isSample ? 'Sample' : 'Hidden'}</span>
                {(tc.inputs || []).map((v, i) => (
                  <span key={i} className="text-xs text-cyan-300">{v.name}: <span className="text-white">{v.value}</span></span>
                ))}
                <span className="text-xs text-green-400">Output:</span> <span className="text-xs">{tc.expectedOutput}</span>
                <button type="button" onClick={() => removeTestCase(idx)} className="ml-auto text-red-400 hover:text-red-200">Remove</button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full py-2 bg-cyan-500 text-black font-bold rounded-md hover:bg-cyan-400 transition shadow-md" disabled={saving}>
          {saving ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Problem' : 'Create Problem')}
        </button>
      </form>
    </div>
  );
} 