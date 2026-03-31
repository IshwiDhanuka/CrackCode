import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import RotatingCodeTerminal from './RotatingCodeTerminal';
import GradientButton from './GradientButton';
import FloatingSymbolsBackground from './FloatingSymbolsBackground';

const HeroSection = () => {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16">
      <FloatingSymbolsBackground />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 lg:gap-14 items-center">
        {/* Left Content */}
        <div className="min-w-0 overflow-hidden space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-[#22D3EE] uppercase tracking-[0.2em] backdrop-blur-md"
          >
            <div className="w-1 h-1 bg-[#00F5FF] rounded-full animate-pulse shadow-[0_0_8px_#00F5FF]"></div>
            <span className="flex items-center gap-1.5">
              <Zap className="w-2.5 h-2.5 fill-[#00F5FF]" />
              Elite Developer Environment v4.2
            </span>
          </motion.div>

          {/* Headline */}
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-[4rem] font-black tracking-tighter leading-[1.1] text-white flex flex-col"
            >
              <span className="block">Master Your Code.</span>
              <span className="bg-gradient-to-r from-[#00F5FF] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,245,255,0.4)] block">
                Crack Your Limits.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-base md:text-lg text-white/50 max-w-md leading-relaxed font-medium tracking-tight"
            >
              The ultimate high-fidelity arena for logical engineers. Optimize algorithms with microsecond precision.
            </motion.p>
          </div>

          {/* Actions & Stats */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link to="/problems">
                <GradientButton className="text-sm px-8 py-3.5">
                  Start Coding
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </GradientButton>
              </Link>

              <Link
                to="/contests"
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all backdrop-blur-xl uppercase tracking-tighter text-sm hover:border-[#6366F1]/50 shadow-inner group"
              >
                <span className="group-hover:text-[#6366F1] transition-colors font-black">View Contests</span>
              </Link>
            </motion.div>

            {/* Thin horizontal separator */}
            <div className="w-full h-px bg-white/5 my-8" />

            {/* Social Proof / Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex gap-8"
            >
              <div>
                <div className="text-lg font-black text-white/90 font-mono">1.2M+</div>
                <div className="text-[8px] text-white/30 uppercase tracking-widest font-mono">Executions</div>
              </div>
              <div>
                <div className="text-lg font-black text-white/90 font-mono">45k+</div>
                <div className="text-[8px] text-white/30 uppercase tracking-widest font-mono">Grandmasters</div>
              </div>
              <div>
                <div className="text-lg font-black text-white/90 font-mono">12ms</div>
                <div className="text-[8px] text-white/30 uppercase tracking-widest font-mono">Avg Latency</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Content: The Monolith */}
        <div className="flex justify-end self-center w-[440px] min-w-[440px] max-w-[440px] flex-shrink-0 flex-grow-0 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className="relative z-10 w-full"
          >
            <RotatingCodeTerminal />
          </motion.div>

          {/* Decorative Backglow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[#3B82F6] opacity-[0.05] blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#8B5CF6] opacity-[0.03] blur-[80px] rounded-full pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
