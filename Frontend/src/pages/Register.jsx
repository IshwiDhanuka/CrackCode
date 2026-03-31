import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import FloatingSymbolsBackground from "../components/FloatingSymbolsBackground";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const isStrongPassword = (pw) =>
  pw.length >= 8 &&
  /[A-Z]/.test(pw) &&
  /[0-9]/.test(pw) &&
  /[^A-Za-z0-9]/.test(pw);

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
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

    if (!isStrongPassword(formData.password)) {
      setPwError("Password must be 8+ chars with an uppercase letter, a number, and a special character.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setErrorMsg("Username may only contain letters, numbers, and underscores.");
      return;
    }

    try {
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

  const pwStrength = !formData.password ? null
    : formData.password.length < 6 ? 'weak'
      : isStrongPassword(formData.password) ? 'strong'
        : 'medium';

  const strengthColor = { weak: 'bg-red-500', medium: 'bg-yellow-400', strong: 'bg-green-500' };
  const strengthWidth = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' };

  return (
    <div className="fixed inset-0 min-h-screen min-w-full flex items-center justify-center bg-[#020617] font-sans overflow-hidden">
      <FloatingSymbolsBackground opacity={0.04} />

      {/* Cyan radial glow behind card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/[0.06] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[400px] w-full px-6 relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
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

        {/* Card */}
        <div
          className="backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', padding: '32px 28px 28px' }}
        >
          {/* Corner glows */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-400/10 blur-[70px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 blur-[70px] rounded-full pointer-events-none" />

          {/* Heading */}
          <h2
            className="text-xl font-bold text-center mb-6"
            style={{
              background: 'linear-gradient(90deg, #fff 60%, rgba(255,255,255,0.55))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Sign Up
          </h2>

          {errorMsg && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg text-xs text-center border border-red-500/20">
                {errorMsg}
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3" autoComplete="off">
            <input
              name="username"
              placeholder="Username (letters, numbers, underscore)"
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
              value={formData.username}
              onChange={handleChange}
              maxLength={20}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
              value={formData.email}
              onChange={handleChange}
              maxLength={100}
              required
            />
            <div className="space-y-1">
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
                value={formData.password}
                onChange={handleChange}
                maxLength={128}
                autoComplete="new-password"
                required
              />
              {formData.password && (
                <div className="pt-1">
                  <div className="w-full bg-white/5 rounded-full h-[3px] mt-1">
                    <div className={`h-[3px] rounded-full transition-all duration-300 ${strengthColor[pwStrength]} ${strengthWidth[pwStrength]}`} />
                  </div>
                  <span className={`text-[11px] font-medium mt-1 block ${pwStrength === 'strong' ? 'text-green-400' : pwStrength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {pwStrength === 'strong' ? 'Strong password' : pwStrength === 'medium' ? 'Medium — add special char' : 'Weak password'}
                  </span>
                </div>
              )}
            </div>

            {pwError && (
              <p className="text-red-400 text-[11px] font-medium px-1">{pwError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 mt-1 bg-gradient-to-r from-[#22D3EE] to-[#6366F1] text-white text-sm font-bold rounded-xl hover:opacity-90 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)] active:scale-[0.98] transition-all duration-200"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-xs text-white/35">
              Already have an account?{" "}
              <Link to="/login" className="text-[#22D3EE] hover:underline font-semibold transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom ambient glow */}
      <div className="fixed -bottom-1/2 left-1/2 -translate-x-1/2 w-full h-[70%] bg-[#3B82F6] opacity-[0.03] blur-[150px] pointer-events-none rounded-full" />
    </div>
  );
};

export default Register;