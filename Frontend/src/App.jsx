// src/App.jsx

import { Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout/layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import Problems from './pages/Problems';
import AdminProblems from './pages/AdminProblems';
import Solve from './pages/Solve';
import Profile from './pages/Profile';
import Contests from './pages/Contests';
import Learning from './pages/Learning';
import Settings from './pages/Settings';
import PrivateRoute from './components/Layout/PrivateRoute';
import Leaderboard from './pages/Leaderboard';

function Home() {
  const token = localStorage.getItem("token"); // ⬅️ Check login status

  return (
    <div className="min-h-screen w-full bg-black font-sans flex flex-col items-center justify-start pt-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center text-yellow-400 mt-4 mb-4 tracking-tight animate-neon-glow" style={{textShadow: '0 0 16px #facc15, 0 0 32px #facc15'}}>
        Welcome to CrackCode
      </h1>
      <p className="text-gray-400 text-base md:text-lg text-center mb-12 mt-0 font-medium max-w-2xl">
        From brute force to optimized elegance—master the craft of code.
      </p>
      <div className="max-w-6xl w-full px-4 py-4">
        <div className="rounded-[2.5rem] p-8 bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Contests Card */}
            <Link to="/contests" className="bg-[#18181b] border border-cyan-500/30 rounded-2xl p-8 shadow-xl hover:scale-105 hover:border-cyan-400 transition-transform cursor-pointer flex flex-col items-center" style={{ textDecoration: 'none' }}>
              <span className="text-cyan-400 text-5xl font-extrabold mb-3" style={{fontFamily: 'monospace'}}>&lt;/&gt;</span>
              <h2 className="text-xl font-bold text-cyan-300 mb-2">Contests</h2>
              <p className="text-gray-400 text-sm text-center">View and participate in upcoming coding contests.</p>
            </Link>

            {/* Problems Card - only if logged in */}
            {token && (
              <Link to="/problems" className="bg-[#18181b] border border-cyan-500/30 rounded-2xl p-8 shadow-xl hover:scale-105 hover:border-cyan-400 transition-transform cursor-pointer flex flex-col items-center" style={{ textDecoration: 'none' }}>
                <svg className="w-10 h-10 mb-3 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <h2 className="text-xl font-bold text-yellow-300 mb-2">Problems</h2>
                <p className="text-gray-400 text-sm text-center">Practice DSA & CP problems to sharpen your skills.</p>
              </Link>
            )}

            {/* Leaderboard Card */}
            <Link to="/leaderboard" className="bg-[#18181b] border border-cyan-500/30 rounded-2xl p-8 shadow-xl hover:scale-105 hover:border-cyan-400 transition-transform cursor-pointer flex flex-col items-center" style={{ textDecoration: 'none' }}>
              <svg className="w-10 h-10 mb-3 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m0 0v2a2 2 0 002 2h2a2 2 0 002-2v-2m0 0v-2a2 2 0 012-2h2a2 2 0 012 2v2" /></svg>
              <h2 className="text-xl font-bold text-violet-300 mb-2">Leaderboard</h2>
              <p className="text-gray-400 text-sm text-center">Track your rank & progress among top coders.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Route */}
        <Route path="/problems" element={<PrivateRoute><Problems /></PrivateRoute>} />

        {/* Other routes */}
        <Route path="/adminproblems" element={<AdminProblems />} />
        <Route path="/solve/:slug" element={<Solve />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Home page */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
      </Routes>

      <ToastContainer />
    </>
  );
}

export default App;
