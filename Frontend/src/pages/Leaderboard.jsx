import { useEffect, useState } from 'react';
import Layout from '../components/Layout/layout';
import axios from 'axios';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/profile/leaderboard');
        setUsers(res.data.leaderboard || []);
      } catch (err) {
        setUsers([]);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto mt-10">
        <h1 className="text-3xl font-extrabold text-center text-cyan-400 mb-8">Leaderboard</h1>
        <div className="bg-[#18181b] rounded-2xl shadow-xl border border-cyan-500/20 p-8">
          <div className="grid grid-cols-3 gap-4 pb-4 border-b border-cyan-400/10 mb-4 text-cyan-300 font-bold text-lg">
            <div>Rank</div>
            <div>User</div>
            <div>Points</div>
          </div>
          {loading ? (
            <div className="text-center text-cyan-300 py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No users found.</div>
          ) : (
            users.map((user, idx) => (
              <div key={user._id || user.username} className={`grid grid-cols-3 gap-4 py-3 border-b border-cyan-400/5 items-center ${idx < 3 ? 'font-extrabold text-yellow-300' : 'text-cyan-100'}`}>
                <div>#{idx + 1}</div>
                <div className="flex items-center gap-2">
                  <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt="avatar" className="w-8 h-8 rounded-full border-2 border-cyan-400" />
                  <span>{user.username}</span>
                </div>
                <div>{user.points}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
} 