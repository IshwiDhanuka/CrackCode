import { Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout/layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Problems from './pages/Problems';
import AdminProblems from './pages/AdminProblems';
import Solve from './pages/Solve';
import Profile from './pages/Profile';
import Contests from './pages/Contests';
import Learning from './pages/Learning';
import Settings from './pages/Settings';
import PrivateRoute, { AdminRoute } from './components/Layout/PrivateRoute';
import Leaderboard from './pages/Leaderboard';
import { motion } from "framer-motion";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import FloatingSymbolsBackground from "./components/FloatingSymbolsBackground";

export const logout = (navigate) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (navigate) navigate('/login', { replace: true });
};

function Home() {
  return (
    <div className="min-h-screen w-full bg-[#020617] text-white font-sans selection:bg-[#00F5FF]/30 relative overflow-hidden">
      <FloatingSymbolsBackground />
      <HeroSection />
      <FeaturesSection />
      
      {/* Decorative background glow */}
      <div className="fixed -bottom-1/2 left-1/2 -translate-x-1/2 w-full h-[80%] bg-[#3B82F6] opacity-[0.03] blur-[150px] pointer-events-none rounded-full"></div>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/problems" element={<PrivateRoute><Problems /></PrivateRoute>} />
        <Route path="/adminproblems" element={<AdminRoute><AdminProblems /></AdminRoute>} />
        <Route path="/solve/:slug" element={<PrivateRoute><Solve /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/" element={<Layout><Home /></Layout>} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;