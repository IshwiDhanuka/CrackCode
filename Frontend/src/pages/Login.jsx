
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      console.log("Email:", email);
      console.log("Password:", password);
      console.log("Remember Me:", rememberMe);
      const { data } = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success('Login successful!');
      setTimeout(() => navigate("/problems"), 1500); // Give user time to see the toast
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen min-w-full flex items-center justify-center bg-black font-sans">
      <div className="max-w-md w-full">
        {/* CrackCode Header */}
        <div className="flex flex-col items-center mb-6">
          {/* Code Bracket Logo */}
          <span className="text-cyan-400 text-5xl font-extrabold mb-2" style={{fontFamily: 'monospace'}}>&lt;/&gt;</span>
          <span className="text-2xl font-bold text-cyan-300 tracking-wide">CrackCode</span>
        </div>
        <div className="bg-[#111] border border-cyan-500/20 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center font-neon">
            Sign In
          </h2>
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
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-cyan-500/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <div className="flex items-center mb-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-cyan-500 focus:ring-cyan-400 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                Remember Me
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-cyan-400 text-black font-bold rounded-md hover:bg-cyan-300 transition shadow-md"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-400">
            Don’t have an account?{" "}
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
