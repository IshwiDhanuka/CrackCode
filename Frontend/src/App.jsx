import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/layout";
import Login from "./pages/Login";
import Register from "./pages/Register";



function Home() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Welcome to CrackCode</h1>
      <p className="text-gray-400 mb-2">
        This is your neon-themed layout preview. Add your content here.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] border border-cyan-500/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-cyan-300 mb-2">Contests</h2>
          <p className="text-gray-400 text-sm">View upcoming coding contests.</p>
        </div>
        <div className="bg-[#1a1a1a] border border-cyan-500/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-cyan-300 mb-2">Problems</h2>
          <p className="text-gray-400 text-sm">Practice DSA & CP problems.</p>
        </div>
        <div className="bg-[#1a1a1a] border border-cyan-500/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-cyan-300 mb-2">Leaderboard</h2>
          <p className="text-gray-400 text-sm">Track your rank & progress.</p>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
