import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiLock } from "react-icons/fi";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    setError("");
    onLogin({ username, password });
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center px-4">
      <div className="bg-slate-800 border border-slate-500 rounded-2xl px-8 py-10 shadow-2xl backdrop-blur-md bg-opacity-30 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Your email</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="example@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="accent-blue-400"
              />
              Remember Me
            </label>
            <a href="#" className="text-blue-300 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-full transition-all duration-200"
          >
            Login
          </button>

          <div className="text-center text-sm text-gray-300 mt-4">
            New here?{" "}
            <Link to="/register" className="text-blue-400 hover:underline font-medium">
              Create an Account
            </Link>
          </div>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
