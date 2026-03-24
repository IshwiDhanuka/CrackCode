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
  examples: [],
  testcases: [],
  functionName: '',
  className: '',
  arguments: '',
  returnType: '',
};

const difficulties = ['Easy', 'Medium', 'Hard'];

export default function ProblemForm({ problem, onClose, onSaved }) {
  const [form, setForm] = useState(defaultProblem);
  const [saving, setSaving] = useState(false);
  const [tcVars, setTcVars] = useState([{ name: '', value: '' }]);
  const [tcOutput, setTcOutput] = useState('');
  const [tcType, setTcType] = useState('Sample');
  const [exampleInput, setExampleInput] = useState('');
  const [exampleOutput, setExampleOutput] = useState('');
  const [exampleExplanation, setExampleExplanation] = useState('');
  const [examples, setExamples] = useState([]);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const isEdit = !!problem;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (problem) {
      setForm({
        ...defaultProblem,
        ...problem,
        tags: Array.isArray(problem.tags) ? problem.tags.join(', ') : (problem.tags || ''),
      });
      setExamples(problem.examples || []);
    } else {
      setForm(defaultProblem);
    }
    setReady(true);
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
    if (!tcVars.every(v => v.value.trim()) || !tcOutput.trim()) {
      toast.warn("Please provide values for all variables and expected output.");
      return;
    }
    
    // Create the raw input string for the runner (values only, newline separated)
    const rawInput = tcVars.map(v => v.value).join('\n');
    
    setForm({
      ...form,
      testcases: [
        ...form.testcases, 
        { 
          inputs: tcVars.map(v => ({ ...v })), // Store for UI/Editing
          input: rawInput,                     // Store for Backend Execution
          expectedOutput: tcOutput, 
          isSample: tcType === 'Sample' 
        }
      ]
    });
    
    setTcVars([{ name: '', value: '' }]);
    setTcOutput('');
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
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        examples: examples,
        // Ensure testcases are cleaned and filtered
        testcases: form.testcases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
          inputs: tc.inputs 
        })).filter(tc => tc.input.trim() !== ''),
        functionName: form.functionName.trim(),
        className: form.className.trim() || 'Solution',
        arguments: form.arguments.trim(),
        returnType: form.returnType.trim()
      };

      if (isEdit) {
        await axios.put(`${backendUrl}/api/problems/${problem.slug}`, payload, config);
        toast.success('Problem updated!');
      } else {
        await axios.post(`${backendUrl}/api/problems/`, payload, config);
        toast.success('Problem created!');
      }

      onSaved && onSaved();
      onClose && onClose();
      navigate('/problems');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error saving problem');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-[#111318] rounded-xl p-6 w-full max-w-3xl border border-cyan-500/20 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
        <button type="button" className="absolute top-4 right-4 text-gray-500 hover:text-white" onClick={onClose}>&times;</button>
        
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">{isEdit ? 'Edit Problem' : 'New Problem'}</h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cyan-500 uppercase">Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Two Sum" className="px-3 py-2 rounded bg-[#1c212c] border border-gray-700 text-white focus:border-cyan-500 outline-none" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cyan-500 uppercase">Slug (URL Key)</label>
            <input name="slug" value={form.slug} onChange={handleChange} placeholder="e.g. two-sum" className="px-3 py-2 rounded bg-[#1c212c] border border-gray-700 text-white focus:border-cyan-500 outline-none" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cyan-500 uppercase">Difficulty</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange} className="px-3 py-2 rounded bg-[#1c212c] border border-gray-700 text-white outline-none">
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cyan-500 uppercase">Tags</label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="Array, Hash Table" className="px-3 py-2 rounded bg-[#1c212c] border border-gray-700 text-white outline-none" />
          </div>
        </div>

        {/* Technical Structure */}
        <div className="bg-black/30 p-4 rounded-lg border border-cyan-900/30 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-yellow-500 uppercase">Return Type</label>
            <input name="returnType" value={form.returnType} onChange={handleChange} placeholder="vector<int>" className="px-3 py-2 rounded bg-[#0a0c10] border border-gray-800 text-cyan-100 font-mono text-sm" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-yellow-500 uppercase">Function Name</label>
            <input name="functionName" value={form.functionName} onChange={handleChange} placeholder="twoSum" className="px-3 py-2 rounded bg-[#0a0c10] border border-gray-800 text-cyan-100 font-mono text-sm" required />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-bold text-yellow-500 uppercase">Arguments</label>
            <input name="arguments" value={form.arguments} onChange={handleChange} placeholder="vector<int>& nums, int target" className="px-3 py-2 rounded bg-[#0a0c10] border border-gray-800 text-cyan-100 font-mono text-sm" required />
          </div>
        </div>

        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Problem Description..." className="w-full mb-4 px-3 py-2 rounded bg-[#1c212c] border border-gray-700 text-white min-h-[100px]" rows={4} required />

        {/* Examples */}
        <div className="mb-6 p-4 border border-gray-800 rounded-lg">
          <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">Example UI Displays</h3>
          <div className="flex flex-col gap-2 mb-3">
            <input value={exampleInput} onChange={e => setExampleInput(e.target.value)} placeholder="Input string" className="px-3 py-1 text-sm rounded bg-[#1c212c] border border-gray-700 text-white" />
            <input value={exampleOutput} onChange={e => setExampleOutput(e.target.value)} placeholder="Output string" className="px-3 py-1 text-sm rounded bg-[#1c212c] border border-gray-700 text-white" />
            <textarea value={exampleExplanation} onChange={e => setExampleExplanation(e.target.value)} placeholder="Explanation (optional)" className="px-3 py-1 text-sm rounded bg-[#1c212c] border border-gray-700 text-white" rows={2} />
            <button type="button" onClick={addExample} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 rounded transition">Add to Examples</button>
          </div>
          <div className="space-y-2">
            {examples.map((ex, idx) => (
              <div key={idx} className="flex justify-between items-start bg-black/40 p-2 rounded text-xs border border-gray-800">
                <div>
                  <div className="text-green-400">In: {ex.input}</div>
                  <div className="text-blue-400">Out: {ex.output}</div>
                </div>
                <button type="button" onClick={() => removeExample(idx)} className="text-red-500 hover:text-red-300">Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* Test Cases (Actual Execution) */}
        <div className="mb-8 p-4 border border-cyan-900/50 bg-cyan-950/5 rounded-lg">
          <h3 className="text-cyan-400 font-bold mb-4 uppercase tracking-widest text-sm">Compiler Test Cases</h3>
          <div className="space-y-3 mb-4">
            {tcVars.map((v, idx) => (
              <div key={idx} className="flex gap-2">
                <input value={v.name} onChange={e => handleTcVarChange(idx, 'name', e.target.value)} placeholder="Var Name (e.g. nums)" className="px-3 py-1 text-sm rounded bg-black border border-gray-700 text-cyan-300 w-1/3" />
                <input value={v.value} onChange={e => handleTcVarChange(idx, 'value', e.target.value)} placeholder="Value (e.g. [2,7,11])" className="px-3 py-1 text-sm rounded bg-black border border-gray-700 text-white flex-1" />
                {tcVars.length > 1 && <button type="button" onClick={() => removeTcVar(idx)} className="text-red-500">×</button>}
              </div>
            ))}
            <button type="button" onClick={addTcVar} className="text-cyan-500 text-xs font-bold hover:underline">+ Add Variable Input</button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input value={tcOutput} onChange={e => setTcOutput(e.target.value)} placeholder="Expected Output" className="px-3 py-2 text-sm rounded bg-black border border-gray-700 text-green-400 flex-1" />
            <select 
              value={tcType} 
              onChange={e => setTcType(e.target.value)} 
              className={`px-3 py-2 text-sm rounded bg-black border font-bold ${tcType === 'Sample' ? 'border-green-600 text-green-400' : 'border-pink-600 text-pink-400'}`}
            >
              <option value="Sample">Sample (Public)</option>
              <option value="Hidden">Hidden (Secret)</option>
            </select>
            <button type="button" onClick={addTestCase} className="bg-white text-black text-xs font-bold px-4 py-2 rounded hover:bg-gray-200 transition">Save Test Case</button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {form.testcases.map((tc, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-black/60 p-2 rounded border border-gray-800">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${tc.isSample ? 'bg-green-900 text-green-200' : 'bg-pink-900 text-pink-200'}`}>
                  {tc.isSample ? 'Sample' : 'Hidden'}
                </span>
                <div className="text-[10px] font-mono flex-1 truncate text-gray-400">
                  {tc.input.replace(/\n/g, ' | ')} → <span className="text-green-500">{tc.expectedOutput}</span>
                </div>
                <button type="button" onClick={() => removeTestCase(idx)} className="text-red-500 hover:text-red-300">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${saving ? 'bg-gray-700 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-black active:scale-[0.98]'}`}
        >
          {saving ? 'Processing Request...' : (isEdit ? 'Update Problem' : 'Create Problem')}
        </button>
      </form>
    </div>
  );
}