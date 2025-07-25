import { useEffect, useState } from 'react';
import axios from 'axios';
import '../pages/solve-neon.css';

const TABS = ["Overview", "Submissions", "Solved", "Settings"];
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.user);
    };
    const fetchRecentActivity = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendUrl}/api/submissions/recent?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentActivity(res.data.submissions);
    };
    fetchProfile();
    fetchRecentActivity();
  }, []);

  if (!profile) return <div className="text-cyan-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-10">
      {/* User Info Card */}
      <div className="w-full max-w-3xl mx-auto flex flex-col md:flex-row items-center md:items-start rounded-3xl bg-white/10 backdrop-blur-md border border-cyan-400/30 shadow-2xl p-8 mb-10 gap-8" style={{boxShadow: '0 4px 32px 0 #22d3ee80, 0 0 0 2px #22d3ee22', background: 'rgba(255,255,255,0.07)'}}>
        <img
          src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`}
          alt="avatar"
          className="w-28 h-28 rounded-full border-4 border-cyan-400 shadow-lg mb-4 md:mb-0"
        />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_#22d3ee]">{profile.username}</h2>
            <span className="ml-2 px-3 py-1 bg-cyan-900/80 text-cyan-200 rounded text-sm font-semibold border border-cyan-400/40 shadow">Rank: #{profile.rank || 1234}</span>
          </div>
          <div className="text-cyan-100 text-lg mb-1">{profile.email}</div>
          <div className="text-gray-400 text-base italic">Bio: <span className="not-italic text-gray-200">(Add your bio!)</span></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-semibold text-cyan-200">Streak</div>
          <div className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]">{profile.streak || 0} 🔥</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-cyan-400/20">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`px-6 py-2 font-semibold text-lg rounded-t-xl transition-colors duration-200 ${activeTab === tab ? 'bg-cyan-900/80 text-cyan-300 border-b-4 border-cyan-400 shadow' : 'text-gray-400 hover:text-cyan-300'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Stats Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-xl p-8 flex flex-col gap-6" style={{background: 'rgba(255,255,255,0.07)'}}>
            <div>
              <div className="text-gray-400 text-base">Problems Solved</div>
              <div className="text-3xl font-bold text-cyan-300">{profile.problemsSolved} <span className="text-gray-400 text-lg">/ {profile.totalProblems}</span></div>
              <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-3 rounded-full" style={{ width: `${(profile.problemsSolved / profile.totalProblems) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-base">Points</div>
              <div className="text-2xl font-semibold text-yellow-300">{profile.points || 0}</div>
            </div>
            <div>
              <div className="text-gray-400 text-base">Accuracy</div>
              <div className="text-2xl font-semibold text-cyan-200">{profile.accuracy || '—'}%</div>
            </div>
            <div>
              <div className="text-gray-400 text-base">Submissions</div>
              <div className="text-2xl font-semibold text-cyan-200">{profile.submissions || '—'}</div>
            </div>
          </div>

          {/* Badges Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-xl p-8 flex flex-col gap-6" style={{background: 'rgba(255,255,255,0.07)'}}>
            <div className="text-2xl font-semibold text-cyan-300 mb-2">Badges</div>
            <div className="flex flex-wrap gap-3">
              {(profile.badges || []).map(badge => (
                <div key={badge.name} className="flex items-center gap-2 bg-cyan-900/60 px-4 py-2 rounded-full text-cyan-200 text-lg font-medium shadow border border-cyan-400/30">
                  <span className="text-2xl">{badge.icon}</span> {badge.name}
                </div>
              ))}
              {(!profile.badges || profile.badges.length === 0) && (
                <div className="text-gray-400">No badges yet</div>
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-xl p-8 flex flex-col gap-6" style={{background: 'rgba(255,255,255,0.07)'}}>
            <div className="text-2xl font-semibold text-cyan-300 mb-2">Recent Activity</div>
            <ul className="divide-y divide-cyan-400/10">
              {recentActivity.length === 0 && <li className="text-gray-400">No recent activity</li>}
              {recentActivity.map((act, idx) => (
                <li key={act._id || idx} className="py-3 flex flex-col">
                  <span className="text-cyan-200 font-medium">
                    {act.status === 'Accepted' ? 'Solved' : 'Submitted'}: <span className="text-cyan-100">{act.problemId?.title || act.problemId || 'Unknown Problem'}</span>
                  </span>
                  <span className="text-gray-400 text-sm">{new Date(act.submissionTime).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "Submissions" && (
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-xl p-8 text-cyan-200 w-full max-w-5xl" style={{background: 'rgba(255,255,255,0.07)'}}>Submissions history coming soon...</div>
      )}
      {activeTab === "Solved" && (
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-xl p-8 w-full max-w-5xl" style={{background: 'rgba(255,255,255,0.07)'}}>
          <div className="text-2xl font-semibold text-cyan-300 mb-2">Solved Problems</div>
          <ul className="list-disc ml-6">
            {profile.solvedProblems.map(pid => (
              <li key={pid} className="text-cyan-200">{pid}</li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === "Settings" && (
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/20 shadow-xl p-8 text-cyan-200 w-full max-w-5xl" style={{background: 'rgba(255,255,255,0.07)'}}>Settings coming soon...</div>
      )}
    </div>
  );
} 