
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/register", formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/"); // Redirect after signup
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-[#111] border border-cyan-500/20 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Sign Up</h2>
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
            className="w-full mb-6 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/30 rounded-md text-white"
            value={formData.password}
            onChange={handleChange}
          />
          <button className="w-full bg-cyan-500 text-black py-2 rounded-md hover:bg-cyan-400 transition">
            Register
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
