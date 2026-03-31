import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Password strength: min 8 chars, at least 1 uppercase, 1 number, 1 special char
const isStrongPassword = (pw) =>
  pw.length >= 8 &&
  /[A-Z]/.test(pw) &&
  /[0-9]/.test(pw) &&
  /[^A-Za-z0-9]/.test(pw);

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    // SECURITY V1 FIX: role is NEVER sent by user — backend always assigns "user"
    // No role field here at all
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    // SECURITY V12 FIX: enforce input length limits client-side
    const limits = { username: 20, email: 100, password: 128 };
    const { name, value } = e.target;
    if (limits[name] && value.length > limits[name]) return;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') setPwError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setPwError("");

    // SECURITY V14 FIX: password strength validation
    if (!isStrongPassword(formData.password)) {
      setPwError("Password must be 8+ chars with an uppercase letter, a number, and a special character.");
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Username: only alphanumeric + underscore
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setErrorMsg("Username may only contain letters, numbers, and underscores.");
      return;
    }

    try {
      // SECURITY V1 FIX: only send the fields the backend needs — NO role field
      await axios.post(`${backendUrl}/api/auth/register`, {
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      toast.success('Registration successful! Please login.');
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed");
    }
  };

  // Password strength indicator
  const pwStrength = !formData.password ? null
    : formData.password.length < 6 ? 'weak'
    : isStrongPassword(formData.password) ? 'strong'
    : 'medium';

  const strengthColor = { weak: 'bg-red-500', medium: 'bg-yellow-400', strong: 'bg-green-500' };
  const strengthWidth = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' };

  return (
    <div className="fixed inset-0 min-h-screen min-w-full flex items-center justify-center bg-black font-sans">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <span className="text-cyan-400 text-5xl font-extrabold mb-2" style={{fontFamily: 'monospace'}}>&lt;/&gt;</span>
          <span className="text-2xl font-bold text-cyan-300 tracking-wide">CrackCode</span>
        </div>
        <div className="bg-[#111] border border-cyan-500/20 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Sign Up</h2>
          {errorMsg && (
            <p className="text-red-400 bg-red-500/10 px-3 py-2 rounded-md text-sm mb-4 text-center">{errorMsg}</p>
          )}
          <form onSubmit={handleRegister} autoComplete="off">
            <div className="mb-4">
              <input
                name="username"
                placeholder="Username (letters, numbers, underscore)"
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
                value={formData.username}
                onChange={handleChange}
                maxLength={20}
                required
              />
            </div>
            <div className="mb-4">
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
                value={formData.email}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>
            <div className="mb-1">
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
                value={formData.password}
                onChange={handleChange}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </div>
            {/* SECURITY V14: Password strength bar */}
            {formData.password && (
              <div className="mb-1">
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                  <div className={`h-1.5 rounded-full transition-all ${strengthColor[pwStrength]} ${strengthWidth[pwStrength]}`} />
                </div>
                <span className={`text-xs ${pwStrength === 'strong' ? 'text-green-400' : pwStrength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {pwStrength === 'strong' ? 'Strong password' : pwStrength === 'medium' ? 'Medium — add special char or number' : 'Too weak'}
                </span>
              </div>
            )}
            {pwError && <p className="text-red-400 text-xs mb-3">{pwError}</p>}
            <div className="mb-6" />
            {/* SECURITY V1 FIX: NO role selector — admin accounts are seeded in DB only */}
            <button
              type="submit"
              className="w-full py-2 bg-cyan-400 text-black font-bold rounded-md hover:bg-cyan-300 transition shadow-md"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;