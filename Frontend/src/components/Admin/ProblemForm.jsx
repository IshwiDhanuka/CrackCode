import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';

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

const CYAN        = '#38bdf8';
const BORDER      = 'rgba(56,189,248,0.15)';
const BORDER_SUB  = 'rgba(56,189,248,0.08)';
const INPUT_BG    = 'rgba(255,255,255,0.03)';
const SECTION_BG  = 'rgba(56,189,248,0.03)';

const inputStyle = {
  background: INPUT_BG,
  border: `1px solid ${BORDER}`,
  borderRadius: '8px',
  color: '#fff',
  outline: 'none',
  width: '100%',
  padding: '8px 12px',
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(56,189,248,0.6)',
  marginBottom: '4px',
  display: 'block',
};

const monoInputStyle = {
  ...inputStyle,
  fontFamily: 'monospace',
  color: '#a5f3fc',
};

export default function ProblemForm({ problem, onClose, onSaved }) {
  const [form, setForm]                       = useState(defaultProblem);
  const [saving, setSaving]                   = useState(false);
  const [tcVars, setTcVars]                   = useState([{ name: '', value: '' }]);
  const [tcOutput, setTcOutput]               = useState('');
  const [tcType, setTcType]                   = useState('Sample');
  const [exampleInput, setExampleInput]       = useState('');
  const [exampleOutput, setExampleOutput]     = useState('');
  const [exampleExplanation, setExampleExplanation] = useState('');
  const [examples, setExamples]               = useState([]);
  const [ready, setReady]                     = useState(false);
  const navigate  = useNavigate();
  const isEdit    = !!problem;
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

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const addExample = () => {
    if (!exampleInput.trim() || !exampleOutput.trim()) return;
    setExamples([...examples, { input: exampleInput, output: exampleOutput, explanation: exampleExplanation }]);
    setExampleInput(''); setExampleOutput(''); setExampleExplanation('');
  };
  const removeExample = idx => setExamples(examples.filter((_, i) => i !== idx));

  const addTcVar = () => setTcVars([...tcVars, { name: '', value: '' }]);
  const removeTcVar = idx => setTcVars(tcVars.filter((_, i) => i !== idx));
  const handleTcVarChange = (idx, field, val) =>
    setTcVars(tcVars.map((v, i) => i === idx ? { ...v, [field]: val } : v));

  const addTestCase = () => {
    if (!tcVars.every(v => v.value.trim()) || !tcOutput.trim()) {
      toast.warn('Please provide values for all variables and expected output.');
      return;
    }
    const formattedInputs = tcVars.map(v => {
      const val = v.value.trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          const parsed = JSON.parse(val.replace(/'/g, '"'));
          if (Array.isArray(parsed)) return `${parsed.length} ${parsed.join(' ')}`;
        } catch { return val; }
      }
      return val;
    });
    setForm({
      ...form,
      testcases: [...form.testcases, {
        inputs: tcVars.map(v => ({ ...v })),
        input: formattedInputs.join('\n'),
        expectedOutput: tcOutput.trim(),
        isSample: tcType === 'Sample',
      }],
    });
    setTcVars([{ name: '', value: '' }]); setTcOutput('');
  };
  const removeTestCase = idx => setForm({ ...form, testcases: form.testcases.filter((_, i) => i !== idx) });

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        examples,
        testcases: form.testcases.map(tc => ({
          input: tc.input, expectedOutput: tc.expectedOutput, isSample: tc.isSample, inputs: tc.inputs,
        })),
        functionName: form.functionName.trim(),
        className: form.className.trim() || 'Solution',
        arguments: form.arguments.trim(),
        returnType: form.returnType.trim(),
      };
      if (isEdit) {
        await axios.put(`${backendUrl}/api/problems/${problem.slug}`, payload, config);
      } else {
        await axios.post(`${backendUrl}/api/problems`, payload, config);
      }
      toast.success('Problem saved successfully!');
      if (onSaved) onSaved();
      if (onClose) onClose();
      navigate('/problems');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving problem');
    } finally { setSaving(false); }
  };

  if (!ready) return null;

  const focusIn  = e => { e.target.style.borderColor = CYAN; e.target.style.boxShadow = '0 0 0 2px rgba(56,189,248,0.1)'; };
  const focusOut = e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none'; };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}>
      <form onSubmit={handleSubmit}
        className="relative w-full max-w-3xl overflow-y-auto"
        style={{
          background: '#020617',
          border: `1px solid ${BORDER}`,
          borderRadius: '16px',
          boxShadow: '0 0 60px rgba(56,189,248,0.1)',
          maxHeight: '90vh',
          padding: '32px',
        }}>

        {/* Close */}
        <button type="button" onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg transition-all duration-200"
          style={{ color: 'rgba(255,255,255,0.4)', border: `1px solid ${BORDER_SUB}` }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}>
          <X size={16} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-white mb-1">
          {isEdit ? 'Edit' : 'New'} <span style={{ color: CYAN }}>Problem</span>
        </h2>
        <p className="font-mono text-xs mb-8" style={{ color: 'rgba(56,189,248,0.4)' }}>
          // {isEdit ? 'update existing challenge' : 'add a new challenge to the arena'}
        </p>

        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { name: 'title', label: 'Title', placeholder: 'e.g. Two Sum' },
            { name: 'slug',  label: 'Slug (URL Key)', placeholder: 'e.g. two-sum' },
          ].map(f => (
            <div key={f.name} className="flex flex-col gap-1">
              <label style={labelStyle}>{f.label}</label>
              <input name={f.name} value={form[f.name]} onChange={handleChange}
                placeholder={f.placeholder} required
                style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Difficulty</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={focusIn} onBlur={focusOut}>
              {difficulties.map(d => <option key={d} value={d} style={{ background: '#020617' }}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Tags</label>
            <input name="tags" value={form.tags} onChange={handleChange}
              placeholder="Array, Hash Table"
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>

        {/* Function signature block */}
        <div className="mb-6 p-4 rounded-xl" style={{ background: SECTION_BG, border: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(250,204,21,0.6)' }}>
            Function Signature
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'returnType',   label: 'Return Type',   placeholder: 'vector<int>' },
              { name: 'functionName', label: 'Function Name', placeholder: 'twoSum' },
            ].map(f => (
              <div key={f.name} className="flex flex-col gap-1">
                <label style={{ ...labelStyle, color: 'rgba(250,204,21,0.6)' }}>{f.label}</label>
                <input name={f.name} value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder} required
                  style={monoInputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            ))}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label style={{ ...labelStyle, color: 'rgba(250,204,21,0.6)' }}>Arguments</label>
              <input name="arguments" value={form.arguments} onChange={handleChange}
                placeholder="vector<int>& nums, int target" required
                style={monoInputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1 mb-4">
          <label style={labelStyle}>Problem Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="Problem Description..." required rows={4}
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            onFocus={focusIn} onBlur={focusOut} />
        </div>

        {/* Constraints */}
        <div className="flex flex-col gap-1 mb-6">
          <label style={labelStyle}>Constraints</label>
          <textarea name="constraints" value={form.constraints} onChange={handleChange}
            placeholder="e.g. 1 <= nums.length <= 10^4" required rows={3}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            onFocus={focusIn} onBlur={focusOut} />
        </div>

        {/* Examples */}
        <div className="mb-6 p-4 rounded-xl" style={{ background: SECTION_BG, border: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(56,189,248,0.6)' }}>
            Example UI Displays
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {[
              { val: exampleInput,       set: setExampleInput,       ph: 'Input string' },
              { val: exampleOutput,      set: setExampleOutput,      ph: 'Output string' },
              { val: exampleExplanation, set: setExampleExplanation, ph: 'Explanation (optional)', area: true },
            ].map((f, i) => f.area
              ? <textarea key={i} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
              : <input key={i} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            )}
            <button type="button" onClick={addExample}
              className="py-2 rounded-lg text-sm font-bold transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)', color: '#000', border: 'none', boxShadow: '0 0 16px rgba(56,189,248,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(56,189,248,0.4)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(56,189,248,0.25)'}>
              Add to Examples
            </button>
          </div>
          <div className="space-y-2">
            {examples.map((ex, idx) => (
              <div key={idx} className="flex justify-between items-start p-3 rounded-lg text-xs"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER_SUB}` }}>
                <div>
                  <div style={{ color: '#4ade80' }}>In: {ex.input}</div>
                  <div style={{ color: CYAN }}>Out: {ex.output}</div>
                  {ex.explanation && <div style={{ color: 'rgba(255,255,255,0.4)' }}>{ex.explanation}</div>}
                </div>
                <button type="button" onClick={() => removeExample(idx)}
                  className="transition-colors" style={{ color: '#f87171' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
                  onMouseLeave={e => e.currentTarget.style.color = '#f87171'}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Test Cases */}
        <div className="mb-8 p-4 rounded-xl" style={{ background: SECTION_BG, border: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(56,189,248,0.6)' }}>
            Compiler Test Cases
          </p>
          <div className="space-y-2 mb-3">
            {tcVars.map((v, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input value={v.name} onChange={e => handleTcVarChange(idx, 'name', e.target.value)}
                  placeholder="Var Name"
                  style={{ ...inputStyle, width: '33%', fontFamily: 'monospace', color: CYAN }}
                  onFocus={focusIn} onBlur={focusOut} />
                <input value={v.value} onChange={e => handleTcVarChange(idx, 'value', e.target.value)}
                  placeholder="Value"
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={focusIn} onBlur={focusOut} />
                {tcVars.length > 1 && (
                  <button type="button" onClick={() => removeTcVar(idx)} style={{ color: '#f87171' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addTcVar}
              className="text-xs font-bold transition-colors"
              style={{ color: CYAN }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = CYAN}>
              + Add Variable Input
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input value={tcOutput} onChange={e => setTcOutput(e.target.value)}
              placeholder="Expected Output"
              style={{ ...inputStyle, flex: 1, color: '#4ade80' }}
              onFocus={focusIn} onBlur={focusOut} />
            <select value={tcType} onChange={e => setTcType(e.target.value)}
              style={{
                ...inputStyle,
                width: 'auto',
                fontWeight: 700,
                color: tcType === 'Sample' ? '#4ade80' : '#f472b6',
                borderColor: tcType === 'Sample' ? 'rgba(74,222,128,0.3)' : 'rgba(244,114,182,0.3)',
              }}>
              <option value="Sample" style={{ background: '#020617' }}>Sample (Public)</option>
              <option value="Hidden" style={{ background: '#020617' }}>Hidden (Secret)</option>
            </select>
            <button type="button" onClick={addTestCase}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap"
              style={{ background: '#fff', color: '#000', border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              Save Test Case
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {form.testcases.map((tc, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER_SUB}` }}>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  style={{
                    background: tc.isSample ? 'rgba(74,222,128,0.1)' : 'rgba(244,114,182,0.1)',
                    color: tc.isSample ? '#4ade80' : '#f472b6',
                    border: `1px solid ${tc.isSample ? 'rgba(74,222,128,0.2)' : 'rgba(244,114,182,0.2)'}`,
                  }}>
                  {tc.isSample ? 'Sample' : 'Hidden'}
                </span>
                <div className="text-[11px] font-mono flex-1 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {tc.input.replace(/\n/g, ' | ')} →{' '}
                  <span style={{ color: '#4ade80' }}>{tc.expectedOutput}</span>
                </div>
                <button type="button" onClick={() => removeTestCase(idx)} style={{ color: '#f87171' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={saving}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200"
          style={{
            background: saving
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
            color: saving ? 'rgba(255,255,255,0.3)' : '#000',
            border: 'none',
            boxShadow: saving ? 'none' : '0 0 24px rgba(56,189,248,0.35)',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = '0 0 36px rgba(56,189,248,0.5)'; }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.boxShadow = '0 0 24px rgba(56,189,248,0.35)'; }}>
          {saving ? '// processing...' : (isEdit ? 'Update Problem' : 'Create Problem')}
        </button>
      </form>
    </div>
  );
}