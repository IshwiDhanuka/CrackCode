import Layout from '../components/Layout/layout';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import React from 'react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
// SECURITY V5 FIX: rehype-sanitize strips dangerous HTML from AI markdown output
import rehypeSanitize from 'rehype-sanitize';
import './solve-neon.css';

const languageOptions = [
  { label: 'C++', value: 'cpp' },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// SECURITY V6 FIX: Simple client-side rate limiter
// Allows at most MAX_CALLS per WINDOW_MS per action
const createRateLimiter = (maxCalls, windowMs) => {
  const calls = [];
  return () => {
    const now = Date.now();
    // Remove calls outside the window
    while (calls.length && calls[0] < now - windowMs) calls.shift();
    if (calls.length >= maxCalls) return false;
    calls.push(now);
    return true;
  };
};
// Max 5 runs per 30 seconds, max 3 submits per 60 seconds
const canRun = createRateLimiter(5, 30_000);
const canSubmit = createRateLimiter(3, 60_000);

// SECURITY V7 FIX: Maximum code size (50KB is generous for competitive programming)
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

  const userHasEdited = useRef(false);

  const buildBoilerplate = (prob) => {
    if (!prob) return '';
    if (prob.className && prob.className.trim()) {
      return `class ${prob.className} {\npublic:\n    ${prob.returnType} ${prob.functionName}(${prob.arguments}) {\n        // your code here\n    }\n};`;
    }
    return `${prob.returnType} ${prob.functionName}(${prob.arguments}) {\n    // your code here\n}`;
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${backendUrl}/api/problems/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setProblem(data.problem);
          setTestcases(data.testcases || []);
          setCode(buildBoilerplate(data.problem));
          userHasEdited.current = false;
        }
      } catch (err) {
        setProblem(null);
      }
    };
    fetchProblem();
  }, [slug]);

  useEffect(() => {
    if (!userHasEdited.current && problem) {
      setCode(buildBoilerplate(problem));
    }
  }, [language, problem]);

  const fetchSubmissions = async () => {
    if (!problem?._id) return;
    setSubmissionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendUrl}/api/submissions?problemId=${problem._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setSubmissions(res.data.submissions || []);
    } catch (err) {
      setSubmissions([]);
    }
    setSubmissionsLoading(false);
  };

  useEffect(() => {
    if (problem?._id) fetchSubmissions();
  }, [problem?._id]);

  const handleRun = async () => {
    if (!problem || testcases.length === 0) {
      toast.error("Problem data not loaded yet.");
      return;
    }

    // SECURITY V6 FIX: rate limit run requests
    if (!canRun()) {
      toast.warning("Slow down — you can run at most 5 times per 30 seconds.");
      return;
    }

    // SECURITY V7 FIX: reject oversized code
    if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
      toast.error("Code is too large (max 50KB).");
      return;
    }

    setIsRunning(true);
    setOutput("Compiling and running sample cases...");
    setShowOutput(true);

    try {
      const sampleCases = testcases.filter(tc => tc.isSample);
      const payload = {
        slug,
        language,
        code,
        className: problem.className || 'Solution',
        functionName: problem.functionName,
        arguments: problem.arguments,
        returnType: problem.returnType,
        testcases: sampleCases.length > 0 ? sampleCases : testcases.slice(0, 1),
      };

      const response = await axios.post(`${backendUrl}/run`, payload, { timeout: 45000 });

      if (response.data.success) {
        const resultText = response.data.results.map((res, idx) =>
          `Case ${idx + 1}: ${res.passed ? '✓ PASSED' : '✗ FAILED'}\nOutput:   ${res.output}\nExpected: ${res.expected}${res.errorType ? `\nError: ${res.errorType}` : ''}`
        ).join('\n\n');
        setOutput(resultText);
        setSubmitResults(response.data.results);
      } else {
        setOutput(`Error (${response.data.type || 'Unknown'}):\n${response.data.error || 'Execution failed'}`);
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || "Error connecting to compiler.";
      const errType = error.response?.data?.type || '';
      setOutput(errType ? `${errType}:\n${errMsg}` : errMsg);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    // SECURITY V6 FIX: rate limit submit requests
    if (!canSubmit()) {
      toast.warning("Slow down — you can submit at most 3 times per 60 seconds.");
      return;
    }

    // SECURITY V7 FIX: reject oversized code
    if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
      toast.error("Code is too large (max 50KB).");
      return;
    }

    setSubmitLoading(true);
    setSubmitResults(null);
    setSubmitVerdict(null);

    try {
      const startTime = Date.now();
      const res = await fetch(`${backendUrl}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          language,
          code,
          testcases,
          functionName: problem?.functionName,
          className: problem?.className,
          arguments: problem?.arguments,
          returnType: problem?.returnType
        })
      });
      const endTime = Date.now();
      const data = await res.json();

      let verdict = 'Error';
      let passed = 0;
      const total = testcases.length;

      if (data.success && Array.isArray(data.results)) {
        setSubmitResults(data.results);
        passed = data.results.filter(tc => tc.passed).length;
        const hasCompilationError = data.results.some(r => r.errorType === 'Compilation Error');
        const hasRuntimeError = data.results.some(r => r.errorType === 'Runtime Error');
        if (hasCompilationError) verdict = 'Compilation Error';
        else if (hasRuntimeError) verdict = 'Runtime Error';
        else verdict = data.results.every(tc => tc.passed) ? 'Accepted' : 'Wrong Answer';
        setSubmitVerdict(verdict);
      } else {
        verdict = data.type || 'Error';
        setSubmitVerdict(verdict);
      }

      setResultStats({ verdict, passed, total, runtime: endTime - startTime });
      setShowResultModal(true);

      try {
        const token = localStorage.getItem('token');
        await axios.post(`${backendUrl}/api/submissions`, {
          problemId: problem._id,
          status: verdict,
          language,
          code
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (_) { }

    } catch (err) {
      setSubmitResults(null);
      setSubmitVerdict('Error');
      setResultStats({ verdict: 'Error', passed: 0, total: testcases.length, runtime: null });
      setShowResultModal(true);
    }
    setSubmitLoading(false);
  };

  const getReview = async () => {
    setAILoading(true);
    setAIReview('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${backendUrl}/api/ai/review`,
        { code, problem: problem?.description || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAIReview(res.data.review);
    } catch (err) {
      setAIReview('AI review failed.');
    }
    setAILoading(false);
  };

  const getHint = async () => {
    setAILoading(true);
    setAIHint('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${backendUrl}/api/ai/hint`,
        { problem: problem?.description || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAIHint(res.data.hint);
    } catch (err) {
      setAIHint('AI hint failed.');
    }
    setAILoading(false);
  };

  const sampleTestcases = testcases.filter(tc => tc.isSample);
  const hiddenTestcases = testcases.filter(tc => !tc.isSample);

  return (
    <Layout>
      <main className="flex-1 flex flex-row gap-0">
        {/* Left Panel */}
        <section className="w-full md:w-[48%] h-[calc(100vh-64px)] overflow-y-auto p-8 bg-[#10131c] border-r border-[#232b3a] text-white flex flex-col custom-scrollbar">
          <h2 className="text-2xl font-bold text-white mb-2 neon-heading" style={{ textShadow: '0 0 12px #38bdf8, 0 0 24px #38bdf8' }}>
            {problem ? problem.title : 'Loading...'}
          </h2>
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            {problem?.difficulty && (
              <span className={`px-4 py-1 rounded-full text-xs font-mono font-bold mr-2
                ${problem.difficulty === 'Easy' ? 'bg-green-800 text-green-200 shadow-[0_0_8px_2px_#22c55e]' : ''}
                ${problem.difficulty === 'Medium' ? 'bg-orange-700 text-orange-200 shadow-[0_0_8px_2px_#f59e42]' : ''}
                ${problem.difficulty === 'Hard' ? 'bg-red-800 text-red-200 shadow-[0_0_8px_2px_#ef4444]' : ''}
              `}>
                {problem.difficulty}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-cyan-900/80 text-cyan-200 text-xs font-bold border border-cyan-400/40 shadow">
              Points: {problem?.difficulty === 'Easy' ? 10 : problem?.difficulty === 'Medium' ? 20 : problem?.difficulty === 'Hard' ? 30 : '--'}
            </span>
            {(Array.isArray(problem?.tags)
              ? problem.tags.map(t => t.replace(/[{}]/g, '').trim())
              : (typeof problem?.tags === 'string'
                ? problem.tags.split(',').map(t => t.replace(/[{}]/g, '').trim())
                : [])
            ).map(tag => (
              <span key={tag} className="bg-[#232b3a] text-cyan-200 text-xs px-3 py-1 rounded-full font-mono shadow-neon-cyan cursor-pointer hover:bg-[#22d3ee] hover:text-black transition">
                {tag}
              </span>
            ))}
          </div>

          <div className="mb-6">
            <div className="uppercase text-cyan-400 text-xs font-bold mb-1">Description</div>
            <div className="bg-[#181d29] rounded p-4 text-gray-200 text-sm shadow-inner border border-[#232b3a]">
              {problem ? problem.description : 'Fetching problem description...'}
            </div>
          </div>

          {problem?.examples && problem.examples.length > 0 && (
            <div className="mb-4">
              <div className="uppercase text-cyan-400 text-xs font-bold mb-1">Examples</div>
              {problem.examples.map((ex, i) => (
                <div key={i} className="mb-3 bg-[#181d29] rounded p-3 border border-cyan-800">
                  <div className="text-cyan-300 font-mono text-xs mb-1"><b>Input:</b> {ex.input}</div>
                  <div className="text-green-400 font-mono text-xs mb-1"><b>Output:</b> {ex.output}</div>
                  {ex.explanation && <div className="text-gray-400 text-xs"><b>Explanation:</b> {ex.explanation}</div>}
                </div>
              ))}
            </div>
          )}

          {problem?.constraints && (
            <div className="mb-4">
              <div className="uppercase text-cyan-400 text-xs font-bold mb-1">Constraints</div>
              <div className="bg-[#181d29] rounded p-3 text-gray-200 text-xs border border-[#232b3a] whitespace-pre-line">{problem.constraints}</div>
            </div>
          )}
        </section>

        {/* Right Panel */}
        <section className="w-full md:w-[52%] h-[calc(100vh-64px)] flex flex-col bg-[#0a0d14] p-8 custom-scrollbar overflow-y-auto">
          <div className="flex items-center mb-4">
            <span className="text-cyan-300 font-bold tracking-widest text-sm">Code Terminal</span>
          </div>
          <div className="mb-2">
            <label className="text-cyan-400 text-xs font-bold mr-2">Select Language:</label>
            <select
              className="bg-[#181d29] text-cyan-200 border border-[#232b3a] rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {languageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <label className="text-cyan-400 text-xs font-bold mr-2">Code Editor:</label>
            <textarea
              className="w-full h-64 bg-[#181d29] text-cyan-200 font-mono rounded-lg p-4 border border-[#232b3a] focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none text-sm"
              value={code}
              onChange={e => {
                setCode(e.target.value);
                userHasEdited.current = true;
              }}
              spellCheck={false}
            />
            {/* SECURITY V7: Show code size warning */}
            {code.length > 40_000 && (
              <p className="text-yellow-400 text-xs mt-1">Warning: code is large ({(new TextEncoder().encode(code).length / 1024).toFixed(1)}KB / 50KB max)</p>
            )}
          </div>
          <div className="flex gap-2 mb-2 flex-wrap">
            <button
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-6 py-2 rounded-md shadow transition text-xs"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-2 rounded-md shadow transition text-xs"
              onClick={handleSubmit}
              disabled={submitLoading}
            >
              {submitLoading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              className="bg-[#6c47ff] hover:bg-[#8f5fff] text-white font-semibold px-6 py-2 rounded-md shadow transition text-xs"
              onClick={getReview}
              disabled={aiLoading}
            >
              AI Review
            </button>
            <button
              className="bg-[#ffb300] hover:bg-[#ffd54f] text-black font-semibold px-6 py-2 rounded-md shadow transition text-xs"
              onClick={getHint}
              disabled={aiLoading}
            >
              AI Hint
            </button>
          </div>

          {showOutput && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Terminal Output</label>
                <button onClick={() => setShowOutput(false)} className="text-gray-500 hover:text-white text-xs">[Clear]</button>
              </div>
              <pre className="w-full min-h-[120px] max-h-[250px] bg-[#05070a] text-green-400 font-mono rounded-lg p-4 border border-cyan-900/50 overflow-auto text-xs">
                {isRunning
                  ? <span className="animate-pulse">Executing on Docker...</span>
                  : output || "No output."}
              </pre>
            </div>
          )}

          {aiLoading && <div className="text-cyan-300 mt-2 text-xs">Loading AI response...</div>}

          {/* SECURITY V5 FIX: rehypeSanitize strips any HTML/script tags from AI output */}
          {aiReview && (
            <div className="mt-4 bg-[#181d29] border-l-4 border-[#6c47ff] text-white p-4 rounded shadow text-sm prose prose-invert max-w-none">
              <b>AI Review:</b>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{aiReview}</ReactMarkdown>
            </div>
          )}
          {aiHint && (
            <div className="mt-4 bg-[#181d29] border-l-4 border-[#ffb300] text-white p-4 rounded shadow text-sm prose prose-invert max-w-none">
              <b>AI Hint:</b>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{aiHint}</ReactMarkdown>
            </div>
          )}

          {/* Test Cases Panel */}
          <div className="mt-6">
            <div className="flex gap-2 mb-2 flex-wrap">
              {sampleTestcases.map((tc, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-1 rounded-t text-xs font-bold transition border-b-2 ${activeTestTab === idx ? 'border-cyan-400 text-cyan-300 bg-[#181d29]' : 'border-transparent text-gray-400 bg-transparent hover:text-cyan-200'}`}
                  onClick={() => setActiveTestTab(idx)}
                >
                  Case {idx + 1}
                </button>
              ))}
              {hiddenTestcases.map((tc, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-1 rounded-t text-xs font-bold transition border-b-2 ${activeTestTab === sampleTestcases.length + idx ? 'border-pink-400 text-pink-300 bg-[#181d29]' : 'border-transparent text-gray-400 bg-transparent hover:text-pink-200'}`}
                  onClick={() => setActiveTestTab(sampleTestcases.length + idx)}
                >
                  Hidden {idx + 1}
                </button>
              ))}
            </div>
            <div className="bg-[#181d29] rounded p-3 border border-[#22d3ee] shadow-neon-cyan">
              {activeTestTab < sampleTestcases.length ? (
                <>
                  <div className="text-cyan-300 font-mono text-xs mb-1"><b>Input:</b> {sampleTestcases[activeTestTab]?.input}</div>
                  <div className="text-green-400 font-mono text-xs mb-1"><b>Expected:</b> {sampleTestcases[activeTestTab]?.expectedOutput}</div>
                  {submitResults && submitResults[activeTestTab] && (
                    <>
                      <div className="text-yellow-300 font-mono text-xs mb-1"><b>Your Output:</b> {submitResults[activeTestTab].output}</div>
                      <div className={`text-xs font-bold mt-2 ${submitResults[activeTestTab].passed ? 'text-green-400' : 'text-red-400'}`}>
                        {submitResults[activeTestTab].passed ? '✓ Passed' : '✗ Failed'}
                        {submitResults[activeTestTab].errorType && ` (${submitResults[activeTestTab].errorType})`}
                      </div>
                    </>
                  )}
                </>
              ) : (
                submitResults
                  ? submitResults[activeTestTab]
                    ? (
                      <div className={`text-xl font-bold text-center ${submitResults[activeTestTab].passed ? 'text-green-400' : 'text-red-400'}`}>
                        {submitResults[activeTestTab].passed ? '✓ Passed' : '✗ Failed'}
                        {submitResults[activeTestTab].errorType && (
                          <div className="text-sm mt-1 text-yellow-300">{submitResults[activeTestTab].errorType}</div>
                        )}
                      </div>
                    )
                    : <div className="text-center text-gray-400 text-xs">No result for this test case.</div>
                  : <div className="text-center text-gray-400 text-xs">Submit to see hidden test results.</div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#181d29] rounded-xl p-8 w-full max-w-md border border-cyan-500/30 shadow-2xl relative flex flex-col items-center">
            <button type="button" className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-200 text-xl" onClick={() => setShowResultModal(false)}>&times;</button>
            <h2 className={`text-2xl font-bold mb-2 ${resultStats.verdict === 'Accepted' ? 'text-green-400' :
                resultStats.verdict === 'Wrong Answer' ? 'text-red-400' :
                  resultStats.verdict === 'Compilation Error' ? 'text-yellow-400' :
                    'text-orange-400'
              }`}>{resultStats.verdict}</h2>
            <div className="text-cyan-300 text-lg mb-2">{resultStats.passed} / {resultStats.total} testcases passed</div>
            <div className="text-cyan-200 text-base mb-2">Runtime: {resultStats.runtime !== null ? `${resultStats.runtime} ms` : 'N/A'}</div>
            <button className="mt-4 px-6 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition" onClick={() => setShowResultModal(false)}>Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Solve;