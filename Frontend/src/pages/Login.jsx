import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import FloatingSymbolsBackground from "../components/FloatingSymbolsBackground";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (email.length > 100 || password.length > 128) {
      setErrorMsg("Input too long.");
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
        email: email.toLowerCase().trim(),
        password,
      });

      if (!data || !data.token || !data.user) {
        setErrorMsg("Unexpected response from server. Please try again.");
        return;
      }

      if (isTokenExpired(data.token)) {
        setErrorMsg("Received invalid session. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
      }));

      toast.success('Login successful!');
      setTimeout(() => navigate("/problems"), 1500);
    } catch (err) {
      setErrorMsg("Invalid email or password.");
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen min-w-full flex items-center justify-center bg-[#020617] font-sans overflow-hidden">
      <FloatingSymbolsBackground />

      {/* Cyan radial glow centered behind card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-cyan-500/[0.06] blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="max-w-[400px] w-full px-6 relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <span
            className="text-[#22D3EE] text-5xl font-extrabold mb-2 leading-none"
            style={{ fontFamily: 'monospace' }}
          >
            &lt;/&gt;
          </span>
          <span className="text-2xl font-black text-[#22D3EE] tracking-tighter">
            CrackCode
          </span>
        </div>

        {/* Glass card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-8 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.5)] relative overflow-hidden">

          {/* Inner corner glows */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-400/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

          {/* Heading with gradient text */}
          <h2
            className="text-xl font-bold text-center mb-7"
            style={{
              background: 'linear-gradient(to right, #ffffff, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Sign In
          </h2>

          {errorMsg && (
            <div className="mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-red-400 bg-red-500/10 px-4 py-2.5 rounded-lg text-xs text-center border border-red-500/20">
                {errorMsg}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={128}
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              className="w-full py-3 mt-1 bg-gradient-to-r from-[#22D3EE] to-[#6366F1] text-white text-sm font-bold rounded-xl hover:opacity-90 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)] active:scale-[0.98] transition-all duration-200"
            >
              Login
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-xs text-white/35">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#22D3EE] hover:underline font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom ambient glow */}
      <div className="fixed -bottom-1/2 left-1/2 -translate-x-1/2 w-full h-[80%] bg-[#3B82F6] opacity-[0.03] blur-[150px] pointer-events-none rounded-full" />
    </div>
  );
};

export default Login;