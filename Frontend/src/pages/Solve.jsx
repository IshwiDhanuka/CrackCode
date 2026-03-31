import Layout from '../components/Layout/layout';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import React from 'react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import './solve-neon.css';
import { Play, Send, Sparkles, Lightbulb, ChevronLeft, Terminal, ArrowRight } from 'lucide-react';

const languageOptions = [{ label: 'C++', value: 'cpp' }];
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const createRateLimiter = (maxCalls, windowMs) => {
  const calls = [];
  return () => {
    const now = Date.now();
    while (calls.length && calls[0] < now - windowMs) calls.shift();
    if (calls.length >= maxCalls) return false;
    calls.push(now);
    return true;
  };
};
const canRun = createRateLimiter(5, 30_000);
const canSubmit = createRateLimiter(3, 60_000);
const MAX_CODE_BYTES = 50 * 1024;

const Solve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testcases, setTestcases] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState('');
  const [submitResults, setSubmitResults] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitVerdict, setSubmitVerdict] = useState(null);
  const [activeTestTab, setActiveTestTab] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultStats, setResultStats] = useState({ verdict: '', passed: 0, total: 0, runtime: null });
  const [aiReview, setAIReview] = useState('');
  const [aiHint, setAIHint] = useState('');
  const [aiLoading, setAILoading] = useState(false);
  const [activePanel, setActivePanel] = useState('testcases');
  const userHasEdited = useRef(false);

  const buildBoilerplate = (prob) => {
    if (!prob) return '';
    if (prob.className && prob.className.trim())
      return `class ${prob.className} {\npublic:\n    ${prob.returnType} ${prob.functionName}(${prob.arguments}) {\n        // your code here\n    }\n};`;
    return `${prob.returnType} ${prob.functionName}(${prob.arguments}) {\n    // your code here\n}`;
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${backendUrl}/api/problems/${slug}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setProblem(data.problem);
          setTestcases(data.testcases || []);
          setCode(buildBoilerplate(data.problem));
          userHasEdited.current = false;
        }
      } catch (err) { setProblem(null); }
    };
    fetchProblem();
  }, [slug]);

  useEffect(() => {
    if (!userHasEdited.current && problem) setCode(buildBoilerplate(problem));
  }, [language, problem]);

  const fetchSubmissions = async () => {
    if (!problem?._id) return;
    setSubmissionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendUrl}/api/submissions?problemId=${problem._id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setSubmissions(res.data.submissions || []);
    } catch (err) { setSubmissions([]); }
    setSubmissionsLoading(false);
  };

  useEffect(() => { if (problem?._id) fetchSubmissions(); }, [problem?._id]);

  const handleRun = async () => {
    if (!problem || testcases.length === 0) { toast.error("Problem data not loaded yet."); return; }
    if (!canRun()) { toast.warning("Slow down — you can run at most 5 times per 30 seconds."); return; }
    if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) { toast.error("Code is too large (max 50KB)."); return; }
    setIsRunning(true); setOutput("Compiling and running sample cases..."); setShowOutput(true); setActivePanel('output');
    try {
      const sampleCases = testcases.filter(tc => tc.isSample).map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }));
      const payload = { slug, language, code, className: problem.className || 'Solution', functionName: problem.functionName, arguments: problem.arguments, returnType: problem.returnType, testcases: sampleCases.length > 0 ? sampleCases : testcases.slice(0, 1) };
      const response = await axios.post(`${backendUrl}/run`, payload, { timeout: 45000 });
      if (response.data.success) {
        const resultText = response.data.results.map((res, idx) => `Case ${idx + 1}: ${res.passed ? '✓ PASSED' : '✗ FAILED'}\nOutput:   ${res.output}\nExpected: ${res.expected}${res.errorType ? `\nError: ${res.errorType}` : ''}`).join('\n\n');
        setOutput(resultText); setSubmitResults(response.data.results);
      } else { setOutput(`Error (${response.data.type || 'Unknown'}):\n${response.data.error || 'Execution failed'}`); }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || "Error connecting to compiler.";
      const errType = error.response?.data?.type || '';
      setOutput(errType ? `${errType}:\n${errMsg}` : errMsg);
    } finally { setIsRunning(false); }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) { toast.warning("Slow down — you can submit at most 3 times per 60 seconds."); return; }
    if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) { toast.error("Code is too large (max 50KB)."); return; }
    setSubmitLoading(true); setSubmitResults(null); setSubmitVerdict(null);
    try {
      const startTime = Date.now();
      const res = await fetch(`${backendUrl}/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, language, code, testcases: testcases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })), functionName: problem?.functionName, className: problem?.className, arguments: problem?.arguments, returnType: problem?.returnType }) });
      const endTime = Date.now();
      const data = await res.json();
      let verdict = 'Error'; let passed = 0; const total = testcases.length;
      if (data.success && Array.isArray(data.results)) {
        setSubmitResults(data.results);
        passed = data.results.filter(tc => tc.passed).length;
        const hasCompilationError = data.results.some(r => r.errorType === 'Compilation Error');
        const hasRuntimeError = data.results.some(r => r.errorType === 'Runtime Error');
        if (hasCompilationError) verdict = 'Compilation Error';
        else if (hasRuntimeError) verdict = 'Runtime Error';
        else verdict = data.results.every(tc => tc.passed) ? 'Accepted' : 'Wrong Answer';
        setSubmitVerdict(verdict); setActivePanel('testcases');
      } else { verdict = data.type || 'Error'; setSubmitVerdict(verdict); }
      setResultStats({ verdict, passed, total, runtime: endTime - startTime }); setShowResultModal(true);
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${backendUrl}/api/submissions`, { problemId: problem._id, status: verdict, language, code }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (_) { }
    } catch (err) { setSubmitResults(null); setSubmitVerdict('Error'); setResultStats({ verdict: 'Error', passed: 0, total: testcases.length, runtime: null }); setShowResultModal(true); }
    setSubmitLoading(false);
  };

  const getReview = async () => {
    setAILoading(true); setAIReview(''); setActivePanel('ai');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${backendUrl}/api/ai/review`, { code, problem: problem?.description || '' }, { headers: { Authorization: `Bearer ${token}` } });
      setAIReview(res.data.review);
    } catch (err) { setAIReview('AI review failed.'); }
    setAILoading(false);
  };

  const getHint = async () => {
    setAILoading(true); setAIHint(''); setActivePanel('ai');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${backendUrl}/api/ai/hint`, { problem: problem?.description || '' }, { headers: { Authorization: `Bearer ${token}` } });
      setAIHint(res.data.hint);
    } catch (err) { setAIHint('AI hint failed.'); }
    setAILoading(false);
  };

  const sampleTestcases = testcases.filter(tc => tc.isSample);
  const hiddenTestcases = testcases.filter(tc => !tc.isSample);
  const passedPct = resultStats.total > 0 ? Math.round((resultStats.passed / resultStats.total) * 100) : 0;
  const verdictColorClass = { 'Accepted': 'verdict-accepted', 'Wrong Answer': 'verdict-wrong', 'Compilation Error': 'verdict-compile', 'Runtime Error': 'verdict-runtime' }[submitVerdict] || 'verdict-error';
  const modalBorder = resultStats.verdict === 'Accepted' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.15)';
  const modalGlow = resultStats.verdict === 'Accepted' ? '0 0 60px rgba(52,211,153,0.1)' : '0 0 40px rgba(248,113,113,0.07)';
  const modalTopLine = resultStats.verdict === 'Accepted' ? 'linear-gradient(90deg,transparent,#34d399,transparent)' : 'linear-gradient(90deg,transparent,#f87171,transparent)';
  const verdictTextColor = resultStats.verdict === 'Accepted' ? '#34d399' : resultStats.verdict === 'Wrong Answer' ? '#f87171' : resultStats.verdict === 'Compilation Error' ? '#fbbf24' : '#fb923c';

  return (
    <Layout>
      <main className="solve-root speed-bg" style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'row', background: 'linear-gradient(135deg,#020617 0%,#060d1f 50%,#020617 100%)' }}>

        {/* LEFT PANEL */}
        <section className="custom-scrollbar" style={{ width: '46%', minWidth: 340, height: '100%', overflowY: 'auto', background: 'rgba(2,6,23,0.7)', borderRight: '1px solid rgba(34,211,238,0.07)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, background: 'linear-gradient(225deg,rgba(34,211,238,0.04),transparent 60%)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <button onClick={() => navigate('/problems')} className="mono"
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, color: 'rgba(34,211,238,0.35)', fontSize: 11, letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(34,211,238,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(34,211,238,0.35)'}
            >
              <ChevronLeft size={12} /> PROBLEMS <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{problem?.title || '...'}</span>
            </button>
            <h1 className="neon-heading" style={{ fontSize: 22, marginBottom: 14, lineHeight: 1.2 }}>
              {problem ? problem.title : <span style={{ color: 'rgba(255,255,255,0.15)' }}>Loading...</span>}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {problem?.difficulty && (
                <span className={`badge-${problem.difficulty.toLowerCase()}`}>
                  <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                  {problem.difficulty}
                </span>
              )}
              {problem?.difficulty && <span className="badge-pts">+{problem.difficulty === 'Easy' ? 10 : problem.difficulty === 'Medium' ? 20 : 30} PTS</span>}
              {(Array.isArray(problem?.tags) ? problem.tags.map(t => t.replace(/[{}]/g, '').trim()) : typeof problem?.tags === 'string' ? problem.tags.split(',').map(t => t.replace(/[{}]/g, '').trim()) : []).map(tag => (
                <span key={tag} className="badge-tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
            <div>
              <div className="section-label">Description</div>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13.5, lineHeight: 1.78, margin: 0 }}>{problem ? problem.description : 'Fetching problem description...'}</p>
            </div>
            {problem?.examples?.length > 0 && (
              <div>
                <div className="section-label">Examples</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="example-card">
                      <div className="mono" style={{ padding: '8px 16px 8px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                        Example {i + 1} <span style={{ color: 'rgba(34,211,238,0.3)' }}>I/O</span>
                      </div>
                      <div className="mono" style={{ padding: '10px 16px 10px 18px', fontSize: 12, lineHeight: 1.8 }}>
                        <div><span style={{ color: 'rgba(255,255,255,0.25)' }}>input  </span><span style={{ color: 'rgba(34,211,238,0.85)' }}>{ex.input}</span></div>
                        <div><span style={{ color: 'rgba(255,255,255,0.25)' }}>output </span><span style={{ color: 'rgba(52,211,153,0.85)' }}>{ex.output}</span></div>
                        {ex.explanation && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontFamily: 'Syne,sans-serif' }}>{ex.explanation}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {problem?.constraints && (
              <div>
                <div className="section-label">Constraints</div>
                <div className="mono" style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.018)', padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.38)', whiteSpace: 'pre-line', lineHeight: 1.8 }}>{problem.constraints}</div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#020617' }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 48, background: 'rgba(4,10,30,0.95)', borderBottom: '1px solid rgba(34,211,238,0.07)', flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.4) 40%,rgba(99,102,241,0.4) 70%,transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Terminal size={13} style={{ color: 'rgba(34,211,238,0.5)' }} />
              <span className="mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.1em' }}>SOLVE.CPP</span>
              <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />
              <select className="mono" style={{ background: 'transparent', border: 'none', color: 'rgba(34,211,238,0.65)', fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer', outline: 'none' }} value={language} onChange={e => setLanguage(e.target.value)}>
                {languageOptions.map(opt => <option key={opt.value} value={opt.value} style={{ background: '#020617' }}>{opt.label}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} />
                <span className="mono" style={{ fontSize: 9, color: 'rgba(34,211,238,0.4)', letterSpacing: '0.1em' }}>READY</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn-hint" onClick={getHint} disabled={aiLoading}><Lightbulb size={11} /> HINT</button>
              <button className="btn-review" onClick={getReview} disabled={aiLoading}><Sparkles size={11} /> REVIEW</button>
              <button className="btn-run" onClick={handleRun} disabled={isRunning}>
                {isRunning ? <><span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} /> RUNNING</> : <><Play size={11} fill="currentColor" /> RUN</>}
              </button>
              <button className="btn-submit" onClick={handleSubmit} disabled={submitLoading}>
                {submitLoading ? <><span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'inline-block' }} /> JUDGING</> : <><Send size={11} /> SUBMIT <span className="arrow-fwd"><ArrowRight size={10} /></span></>}
              </button>
            </div>
          </div>

          {/* Code editor */}
          <div className="scanlines" style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 44, background: 'rgba(0,0,0,0.18)', borderRight: '1px solid rgba(255,255,255,0.03)', pointerEvents: 'none', zIndex: 1 }} />
            <textarea className="code-editor custom-scrollbar" value={code} onChange={e => { setCode(e.target.value); userHasEdited.current = true; }} spellCheck={false} style={{ position: 'absolute', inset: 0 }} />
            {code.length > 40_000 && <div className="mono" style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 10, color: 'rgba(251,191,36,0.5)', zIndex: 2 }}>{(new TextEncoder().encode(code).length / 1024).toFixed(1)}KB / 50KB</div>}
          </div>

          {/* Bottom panel */}
          <div style={{ height: 220, borderTop: '1px solid rgba(34,211,238,0.07)', background: 'rgba(2,4,16,0.85)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', height: 40, paddingLeft: 8, flexShrink: 0 }}>
              {[{ key: 'testcases', label: 'TEST CASES' }, { key: 'output', label: 'OUTPUT' }, { key: 'ai', label: 'AI ASSIST' }].map(tab => (
                <button key={tab.key} className={`tab-btn${activePanel === tab.key ? ' active' : ''}`} onClick={() => setActivePanel(tab.key)}>{tab.label}</button>
              ))}
              {submitVerdict && (
                <div style={{ marginLeft: 'auto', marginRight: 12 }}>
                  <span className={`verdict-badge ${verdictColorClass}`}>{submitVerdict}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

              {activePanel === 'testcases' && (
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    {sampleTestcases.map((tc, idx) => {
                      const res = submitResults?.[idx];
                      return <button key={idx} className={`tc-btn${activeTestTab === idx ? ' active-sample' : ''}`} onClick={() => setActiveTestTab(idx)}>{res && <span style={{ fontSize: 8, color: res.passed ? '#34d399' : '#f87171' }}>●</span>}Case {idx + 1}</button>;
                    })}
                    {hiddenTestcases.map((tc, idx) => {
                      const absIdx = sampleTestcases.length + idx;
                      const res = submitResults?.[absIdx];
                      return <button key={idx} className={`tc-btn hidden-btn${activeTestTab === absIdx ? ' active-hidden' : ''}`} onClick={() => setActiveTestTab(absIdx)}>{res && <span style={{ fontSize: 8, color: res.passed ? '#34d399' : '#f87171' }}>●</span>}Hidden {idx + 1}</button>;
                    })}
                  </div>
                  <div className="mono" style={{ fontSize: 12, lineHeight: 1.9 }}>
                    {activeTestTab < sampleTestcases.length ? (
                      <>
                        <div><span style={{ color: 'rgba(255,255,255,0.22)' }}>input    </span><span style={{ color: 'rgba(34,211,238,0.8)' }}>{sampleTestcases[activeTestTab]?.input}</span></div>
                        <div><span style={{ color: 'rgba(255,255,255,0.22)' }}>expected </span><span style={{ color: 'rgba(52,211,153,0.8)' }}>{sampleTestcases[activeTestTab]?.expectedOutput}</span></div>
                        {submitResults?.[activeTestTab] && <>
                          <div><span style={{ color: 'rgba(255,255,255,0.22)' }}>output   </span><span style={{ color: 'rgba(251,191,36,0.8)' }}>{submitResults[activeTestTab].output}</span></div>
                          <div style={{ marginTop: 4, fontWeight: 700, color: submitResults[activeTestTab].passed ? '#34d399' : '#f87171' }}>
                            {submitResults[activeTestTab].passed ? '✓ Passed' : '✗ Failed'}
                            {submitResults[activeTestTab].errorType && <span style={{ color: 'rgba(251,191,36,0.6)', marginLeft: 8, fontWeight: 400, fontSize: 11 }}>({submitResults[activeTestTab].errorType})</span>}
                          </div>
                        </>}
                      </>
                    ) : (
                      submitResults?.[activeTestTab]
                        ? <div style={{ fontWeight: 700, fontSize: 14, color: submitResults[activeTestTab].passed ? '#34d399' : '#f87171' }}>
                          {submitResults[activeTestTab].passed ? '✓ Passed' : '✗ Failed'}
                          {submitResults[activeTestTab].errorType && <div style={{ fontSize: 11, color: 'rgba(251,191,36,0.6)', fontWeight: 400, marginTop: 4 }}>{submitResults[activeTestTab].errorType}</div>}
                        </div>
                        : <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>Submit to see hidden test results.</div>
                    )}
                  </div>
                </div>
              )}

              {activePanel === 'output' && (
                <pre className="output-pre">
                  {isRunning ? <span className="mono pulse-dot" style={{ color: 'rgba(34,211,238,0.6)' }}>● Executing on Docker...</span> : output || <span style={{ color: 'rgba(255,255,255,0.12)' }}>// no output yet — press RUN</span>}
                </pre>
              )}

              {activePanel === 'ai' && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
                  {aiLoading && <span className="mono pulse-dot" style={{ color: 'rgba(99,102,241,0.7)', fontSize: 12 }}>● Thinking...</span>}
                  {aiHint && !aiLoading && <div><div className="ai-label-hint">⚡ Hint</div><div className="prose prose-invert prose-xs max-w-none" style={{ color: 'rgba(255,255,255,0.55)' }}><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{aiHint}</ReactMarkdown></div></div>}
                  {aiReview && !aiLoading && <div style={aiHint ? { marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}><div className="ai-label-review">✦ Review</div><div className="prose prose-invert prose-xs max-w-none" style={{ color: 'rgba(255,255,255,0.55)' }}><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{aiReview}</ReactMarkdown></div></div>}
                  {!aiLoading && !aiHint && !aiReview && <span className="mono" style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12 }}>// press HINT or REVIEW to get AI assistance</span>}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* RESULT MODAL */}
      {showResultModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-card" style={{ background: 'rgba(2,6,23,0.97)', border: `1px solid ${modalBorder}`, borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 400, position: 'relative', boxShadow: modalGlow }}>
            <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 2, borderRadius: 1, background: modalTopLine }} />
            <button onClick={() => setShowResultModal(false)} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, color: verdictTextColor, marginBottom: 6 }}>{resultStats.verdict === 'Accepted' ? '✓' : '✗'}</div>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: verdictTextColor, letterSpacing: '-0.02em', margin: 0 }}>{resultStats.verdict}</h2>
            </div>
            <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ padding: '16px 20px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: 'white' }}>{resultStats.passed}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16, fontWeight: 400 }}>/{resultStats.total}</span></div>
                  <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.16em', marginTop: 3, textTransform: 'uppercase' }}>Tests Passed</div>
                </div>
                <div style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: 'white' }}>{resultStats.runtime ?? '—'}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 400 }}>ms</span></div>
                  <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.16em', marginTop: 3, textTransform: 'uppercase' }}>Runtime</div>
                </div>
              </div>
              <div style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Score</span>
                  <span className="mono" style={{ fontSize: 9, color: 'rgba(34,211,238,0.6)' }}>{passedPct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div className={passedPct < 100 ? 'progress-shimmer' : ''} style={{ height: '100%', borderRadius: 2, width: `${passedPct}%`, background: passedPct === 100 ? 'linear-gradient(90deg,#22D3EE,#34d399)' : 'linear-gradient(90deg,#22D3EE,#6366F1)', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowResultModal(false)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 13, background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Keep Solving</button>
              <button onClick={() => { setShowResultModal(false); navigate('/problems'); }}
                style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'linear-gradient(90deg,#22D3EE,#6366F1)', color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 0 24px rgba(34,211,238,0.18)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px rgba(34,211,238,0.35)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(34,211,238,0.18)'}
              >Problems <span className="arrow-fwd"><ArrowRight size={13} /></span></button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Solve;