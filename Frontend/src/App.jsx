import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import bgImage from "./assets/bg.jpeg";

function App() {
  const handleLogin = (credentials) => {
    console.log("Login attempt:", credentials);
  };

  const handleRegister = async (formData) => {
    try {
      const response = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Registration failed");
      }
  
      const data = await response.json();
      console.log("User registered:", data); // Success from backend
      alert("Registration successful!");
    } catch (err) {
      console.error("Registration error:", err.message);
      alert("Registration failed. Check console.");
    }
  };
  

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterForm onRegister={handleRegister} />} />
      </Routes>
    </div>
  );
}

export default App;
