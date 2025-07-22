
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const { data } = await axios.post("http://localhost:5001/api/auth/register", formData);

      toast.success('Registration successful! Please login.');
      setTimeout(() => navigate("/login"), 1500); // Redirect to login page
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed");
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
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Sign Up</h2>
          {errorMsg && <p className="text-red-400 mb-4">{errorMsg}</p>}
          <form onSubmit={handleRegister}>
            <input
              name="username"
              placeholder="Username"
              className="w-full mb-4 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
              value={formData.username}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full mb-4 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full mb-4 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
              value={formData.password}
              onChange={handleChange}
            />
            <select
              name="role"
              className="w-full mb-4 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
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
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
