import React from 'react';
import { Trophy, Code2, Medal, ArrowUpRight } from 'lucide-react';
import GlassCard from './GlassCard';
import { Link } from 'react-router-dom';

const FeaturesSection = () => {
  return (
    <section className="bg-gradient-to-b from-[#020617] to-[#030712] border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Live Contests */}
          <Link to="/contests">
            <GlassCard 
              className="min-h-[220px]" 
              accentColor="from-[#22D3EE] to-[#3B82F6]"
            >
              <div className="flex flex-col h-full gap-5">
                <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#22D3EE] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:animate-pulse transition-all">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tighter text-white">Live Contests</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    Compete globally in real-time. Test your speed and accuracy.
                  </p>
                  <p className="text-[11px] text-[#22D3EE]/60 font-mono font-bold uppercase tracking-widest pt-1">
                    Real-time ranking updates • Global competition
                  </p>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-black text-white group/btn">
                  <span className="bg-gradient-to-r from-[#22D3EE] to-[#3B82F6] bg-clip-text text-transparent group-hover/btn:underline flex items-center gap-2">
                    Join Contest <ArrowUpRight className="w-4 h-4 text-[#22D3EE]" />
                  </span>
                </div>
              </div>
            </GlassCard>
          </Link>

          {/* Problem Set */}
          <Link to="/problems">
            <GlassCard 
              className="min-h-[220px]" 
              accentColor="from-[#8B5CF6] to-[#6366F1]"
            >
              <div className="flex flex-col h-full gap-5">
                <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:animate-pulse transition-all">
                  <Code2 className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tighter text-white">Problem Set</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    A curated library of algorithmic challenges, from basics to grandmaster.
                  </p>
                  <p className="text-[11px] text-[#8B5CF6]/60 font-mono font-bold uppercase tracking-widest pt-1">
                    1000+ challenges • All difficulty levels
                  </p>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-black text-white group/btn">
                  <span className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent group-hover/btn:underline flex items-center gap-2">
                    Solve Problems <ArrowUpRight className="w-4 h-4 text-[#8B5CF6]" />
                  </span>
                </div>
              </div>
            </GlassCard>
          </Link>

          {/* Leaderboard */}
          <Link to="/leaderboard">
            <GlassCard 
              className="min-h-[220px]" 
              accentColor="from-[#14B8A6] to-[#22D3EE]"
            >
              <div className="flex flex-col h-full gap-5">
                <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#14B8A6] to-[#22D3EE] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)] group-hover:animate-pulse transition-all">
                  <Medal className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tighter text-white">Leaderboard</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    Climb the developer ranks. Build your reputation globally.
                  </p>
                  <p className="text-[11px] text-[#14B8A6]/60 font-mono font-bold uppercase tracking-widest pt-1">
                    Ranked match-making • Grandmaster badges
                  </p>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-black text-white group/btn">
                  <span className="bg-gradient-to-r from-[#14B8A6] to-[#22D3EE] bg-clip-text text-transparent group-hover/btn:underline flex items-center gap-2">
                    View Rankings <ArrowUpRight className="w-4 h-4 text-[#14B8A6]" />
                  </span>
                </div>
              </div>
            </GlassCard>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
