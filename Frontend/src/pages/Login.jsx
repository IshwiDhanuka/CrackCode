import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

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

      // FIX: null check on data and data.user before accessing properties
      if (!data || !data.token || !data.user) {
        setErrorMsg("Unexpected response from server. Please try again.");
        return;
      }

      if (isTokenExpired(data.token)) {
        setErrorMsg("Received invalid session. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      // SECURITY: only store non-sensitive user fields
      localStorage.setItem("user", JSON.stringify({
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
      }));

      toast.success('Login successful!');
      setTimeout(() => navigate("/problems"), 1500);
    } catch (err) {
      // SECURITY: don't expose whether email exists or password was wrong
      setErrorMsg("Invalid email or password.");
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen min-w-full flex items-center justify-center bg-black font-sans">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <span className="text-cyan-400 text-5xl font-extrabold mb-2" style={{fontFamily: 'monospace'}}>&lt;/&gt;</span>
          <span className="text-2xl font-bold text-cyan-300 tracking-wide">CrackCode</span>
        </div>
        <div className="bg-[#111] border border-cyan-500/20 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Sign In</h2>
          {errorMsg && (
            <p className="text-red-400 bg-red-500/10 px-3 py-2 rounded-md text-sm mb-4 text-center">
              {errorMsg}
            </p>
          )}
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-cyan-500/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-cyan-500/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={128}
              autoComplete="new-password"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-cyan-400 text-black font-bold rounded-md hover:bg-cyan-300 transition shadow-md"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-cyan-400 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;