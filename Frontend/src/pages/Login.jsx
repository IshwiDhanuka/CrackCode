
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/"); 
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-[#111] border border-cyan-500/20 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Sign In</h2>
        {errorMsg && <p className="text-red-400 mb-4">{errorMsg}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-cyan-500 text-black py-2 rounded-md hover:bg-cyan-400 transition">
            Login
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
