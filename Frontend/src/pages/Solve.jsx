import Layout from '../components/Layout/layout';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import { Zap } from 'lucide-react';
import './solve-neon.css';

const languageOptions = [
  { label: 'C++', value: 'cpp', boilerplate: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}` },
  // Add more languages and their boilerplates here
];

// Add a function for difficulty color
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'bg-green-700 text-green-300';
    case 'Medium': return 'bg-yellow-700 text-yellow-200';
    case 'Hard': return 'bg-red-700 text-red-200';
    default: return 'bg-gray-700 text-gray-300';
  }
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const compilerUrl = import.meta.env.VITE_COMPILER_URL;

const Solve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [problem, setProblem] = useState(null);
  const [testcases, setTestcases] = useState([]);
  const [code, setCode] = useState(languageOptions[0].boilerplate);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitResults, setSubmitResults] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitVerdict, setSubmitVerdict] = useState(null);
  const [activeSampleTab, setActiveSampleTab] = useState(0);
  const [activeTestTab, setActiveTestTab] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultStats, setResultStats] = useState({ verdict: '', passed: 0, total: 0, runtime: null });
  const [aiReview, setAIReview] = useState('');
  const [aiHint, setAIHint] = useState('');
  const [aiLoading, setAILoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/problems/${slug}`);
        const data = await res.json();
        if (data.success) {
          setProblem(data.problem);
          setTestcases(data.testcases || []);
          // Dynamically generate boilerplate for the code editor
          let boilerplate = '';
          if (data.problem.className && data.problem.className.trim()) {
            boilerplate = `class ${data.problem.className} {\npublic:\n    ${data.problem.returnType} ${data.problem.functionName}(${data.problem.arguments}) {\n        // your code here\n    }\n};`;
          } else {
            boilerplate = `${data.problem.returnType} ${data.problem.functionName}(${data.problem.arguments}) {\n    // your code here\n}`;
          }
          setCode(boilerplate);
          console.log('Fetched testcases:', data.testcases);
        }
      } catch (err) {
        setProblem(null);
      }
    };
    fetchProblem();
  }, [slug]);

  // Update code editor with boilerplate when language changes
  useEffect(() => {
    const lang = languageOptions.find(l => l.value === language);
    if (lang) setCode(lang.boilerplate);
  }, [language]);

  // Fetch submission history
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
  if (!editorRef.current) return;

  setIsRunning(true);
  setOutput("");
  setShowOutput(true);

  try {
    const response = await axios.post(import.meta.env.VITE_COMPILER_URL, {
      language: selectedLanguage,
      code: editorRef.current.getValue(),
      input: inputValue,
    });

    const { output } = response.data;
    setOutput(output);
  } catch (error) {
    console.error("Error running code:", error);
    setOutput("Error running code.");
  } finally {
    setIsRunning(false);
  }
};
c


  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitResults(null);
    setSubmitVerdict(null);
    try {
      const startTime = Date.now();
      const res = await fetch(`${compilerUrl}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      let total = testcases.length;
      if (data.success && Array.isArray(data.results)) {
        setSubmitResults(data.results);
        passed = data.results.filter(tc => tc.passed).length;
        verdict = data.results.every(tc => tc.passed) ? 'Accepted' : 'Wrong Answer';
        setSubmitVerdict(verdict);
      } else {
        setSubmitResults(null);
        setSubmitVerdict('Error');
      }
      // Show result modal
      setResultStats({
        verdict,
        passed,
        total,
        runtime: endTime - startTime
      });
      setShowResultModal(true);
      // Save submission to backend (if you want to keep this for analytics, otherwise remove)
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${backendUrl}/api/submissions`, {
          problemId: problem._id,
          status: verdict,
          language,
          code
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // fetchSubmissions(); // removed since you don't want history
      } catch (err) {}
    } catch (err) {
      setSubmitResults(null);
      setSubmitVerdict('Error');
      setResultStats({ verdict: 'Error', passed: 0, total: testcases.length, runtime: null });
      setShowResultModal(true);
    }
    setSubmitLoading(false);
  };

  // AI Review
  const getReview = async () => {
    setAILoading(true);
    setAIReview('');
    try {
      const res = await axios.post('/api/ai/review', { code, problem: problem?.description || '' });
      setAIReview(res.data.review);
    } catch (err) {
      setAIReview('AI review failed.');
    }
    setAILoading(false);
  };

  // AI Hint
  const getHint = async () => {
    setAILoading(true);
    setAIHint('');
    try {
      const res = await axios.post('/api/ai/hint', { problem: problem?.description || '' });
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
            <h2 className="text-2xl font-bold text-white mb-2 neon-heading" style={{textShadow: '0 0 12px #38bdf8, 0 0 24px #38bdf8'}}> {problem ? problem.title : 'Loading...'} </h2>
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              {problem?.difficulty && (
                <span
                  className={`px-4 py-1 rounded-full text-xs font-mono font-bold mr-2
                    ${problem.difficulty === 'Easy' ? 'bg-green-800 text-green-200 shadow-[0_0_8px_2px_#22c55e]' : ''}
                    ${problem.difficulty === 'Medium' ? 'bg-orange-700 text-orange-200 shadow-[0_0_8px_2px_#f59e42]' : ''}
                    ${problem.difficulty === 'Hard' ? 'bg-red-800 text-red-200 shadow-[0_0_8px_2px_#ef4444]' : ''}
                  `}
                >
                  {problem.difficulty}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-cyan-900/80 text-cyan-200 text-xs font-bold border border-cyan-400/40 shadow">Points: {problem?.difficulty === 'Easy' ? 10 : problem?.difficulty === 'Medium' ? 20 : problem?.difficulty === 'Hard' ? 30 : '--'}</span>
              {(Array.isArray(problem?.tags)
                ? problem.tags.map(t => t.replace(/[{}]/g, '').trim())
                : (typeof problem?.tags === 'string'
                    ? problem.tags.split(',').map(t => t.replace(/[{}]/g, '').trim())
                    : [])
              ).map(tag => (
                <span key={tag} className="bg-[#232b3a] neon-btn-animate text-cyan-200 text-xs px-3 py-1 rounded-full font-mono shadow-neon-cyan cursor-pointer hover:bg-[#22d3ee] hover:text-black transition">
                  {tag}
                </span>
              ))}
            </div>
            {/* Description Section */}
            <div className="mb-6">
              <div className="uppercase text-cyan-400 text-xs font-bold mb-1">Description</div>
              <div className="bg-[#181d29] rounded p-4 text-gray-200 text-sm shadow-inner border border-[#232b3a]">{problem ? problem.description : 'Fetching problem description...'}</div>
            </div>
            {problem?.inputFormat && (
              <div className="mb-4">
                <div className="uppercase text-cyan-400 text-xs font-bold mb-1">Input Format</div>
                <div className="bg-[#181d29] rounded p-3 text-gray-200 text-xs border border-[#232b3a] whitespace-pre-line">{problem.inputFormat}</div>
              </div>
            )}
            {problem?.outputFormat && (
              <div className="mb-4">
                <div className="uppercase text-cyan-400 text-xs font-bold mb-1">Output Format</div>
                <div className="bg-[#181d29] rounded p-3 text-gray-200 text-xs border border-[#232b3a] whitespace-pre-line">{problem.outputFormat}</div>
              </div>
            )}
            {/* Examples Section */}
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
            {/* Constraints Section */}
            {problem?.constraints && (
              <div className="mb-4">
                <div className="uppercase text-cyan-400 text-xs font-bold mb-1">Constraints</div>
                <div className="bg-[#181d29] rounded p-3 text-gray-200 text-xs border border-[#232b3a] whitespace-pre-line">{problem.constraints}</div>
              </div>
            )}
          </section>
          {/* Right Panel */}
          <section className="w-full md:w-[52%] h-[calc(100vh-64px)] flex flex-col bg-[#0a0d14] p-8 custom-scrollbar">
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
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="flex gap-2 mb-2">
              <button
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-6 py-2 rounded-md shadow transition text-xs"
                onClick={handleRun}
                disabled={loading}
              >
                {loading ? 'Running...' : 'Run'}
              </button>
              <button
                className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-2 rounded-md shadow transition text-xs"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? 'Submitting...' : 'Submit'}
              </button>
              {/* AI Buttons */}
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
            {aiLoading && <div className="text-cyan-300 mt-2">Loading AI response...</div>}
            {aiReview && (
              <div className="mt-4 bg-[#181d29] border-l-4 border-[#6c47ff] text-white p-4 rounded shadow">
                <b>AI Review:</b> <br />{aiReview}
              </div>
            )}
            {aiHint && (
              <div className="mt-4 bg-[#181d29] border-l-4 border-[#ffb300] text-white p-4 rounded shadow">
                <b>AI Hint:</b> <br />{aiHint}
              </div>
            )}
            {/* Test Cases Section */}
            
            {/* Testcase/Test Result Panel */}
            <div className="mt-6">
              <div className="flex gap-2 mb-2">
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
                {/* Show sample test case details if a sample tab is active */}
                {activeTestTab < sampleTestcases.length ? (
                  <>
                    <div className="text-cyan-300 font-mono text-xs mb-1"><b>Input:</b> {sampleTestcases[activeTestTab]?.input}</div>
                    <div className="text-green-400 font-mono text-xs mb-1"><b>Expected Output:</b> {sampleTestcases[activeTestTab]?.expectedOutput}</div>
                    {submitResults && submitResults[activeTestTab] && (
                      <>
                        <div className="text-yellow-300 font-mono text-xs mb-1"><b>Your Output:</b> {submitResults[activeTestTab].output}</div>
                        <div className={`text-xs font-bold mt-2 ${submitResults[activeTestTab].passed ? 'text-green-400' : 'text-red-400'}`}>{submitResults[activeTestTab].passed ? 'Passed' : 'Failed'}</div>
                      </>
                    )}
                  </>
                ) : (
                  // Show hidden test case result if a hidden tab is active
                  submitResults
                    ? submitResults[activeTestTab]
                      ? (
                        <div className={`text-xl font-bold text-center ${submitResults[activeTestTab].passed ? 'text-green-400' : 'text-red-400'}`}>
                          {submitResults[activeTestTab].passed ? 'Passed' : 'Failed'}
                        </div>
                      )
                      : <div className="text-center text-gray-400">No result for this test case.</div>
                    : <div className="text-center text-gray-400">Submit to see results.</div>
                )}
              </div>
            </div>
          </section>
        </main>
        {/* LeetCode-style Result Modal */}
        {showResultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-[#181d29] rounded-xl p-8 w-full max-w-md border border-cyan-500/30 shadow-2xl relative flex flex-col items-center">
              <button type="button" className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-200 text-xl" onClick={() => setShowResultModal(false)}>&times;</button>
              <h2 className={`text-2xl font-bold mb-2 ${resultStats.verdict === 'Accepted' ? 'text-green-400' : resultStats.verdict === 'Wrong Answer' ? 'text-red-400' : 'text-yellow-400'}`}>{resultStats.verdict}</h2>
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