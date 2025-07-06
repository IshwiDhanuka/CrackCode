import React, { useState } from "react";
import { Link } from "react-router-dom";

const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, email, password, role } = formData;
    if (!username || !email || !password || !role) {
      setError("All fields are required.");
      return;
    }
    setError("");
    onRegister(formData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-slate-800 border-2 border-slate-500 rounded-2xl px-7 py-9 shadow-2xl backdrop-filter backdrop-blur-sm bg-opacity-30 w-full max-w-xs">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-full transition-all duration-200"
          >
            Register
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-center text-sm text-gray-300 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-medium">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
