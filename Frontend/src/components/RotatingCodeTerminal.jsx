import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon } from 'lucide-react';
import TypingCodeAnimation from './TypingCodeAnimation';

const RotatingCodeTerminal = () => {
  const codeLines = useMemo(() => [
    "// Welcome to CrackCode",
    "",
    "#include <bits/stdc++.h>",
    "using namespace std;",
    "",
    "int main() {",
    "    cout << \"Welcome to CrackCode\";",
    "    cout << \"Sharpen your logic.\";",
    "    cout << \"Crack Your Limits.\";",
    "}"
  ], []);

  return (
    <div className="[perspective:2000px] w-full max-w-[440px] mx-auto py-8">
      <motion.div
        initial={{ rotateY: -10, rotateX: 5 }}
        animate={{
          rotateY: [-10, 10, -10],
          rotateX: [5, -5, 5],
          y: [0, -10, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative group cursor-default scale-95 origin-center"
      >
        {/* Neon Glow Layer */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#00F5FF]/30 via-[#3B82F6]/30 to-[#8B5CF6]/30 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>

        {/* Main Glass Terminal */}
        <div className="relative bg-[#020617]/85 backdrop-blur-2xl border border-white/10 rounded-xl overflow-visible pb-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/5 opacity-90">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-60"></div>
              </div>
              <div className="h-3 w-px bg-white/10 mx-1.5"></div>
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.15em] flex items-center gap-1.5">
                <TerminalIcon className="w-2.5 h-2.5" />
                solve.cpp
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">ASCII :: x64</div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F]/80 shadow-[0_0_6px_#27C93F]"></div>
            </div>
          </div>

          {/* Terminal Content Area */}
          <div className="p-5 font-mono text-[11px] sm:text-[13px] leading-relaxed min-h-[320px] overflow-visible bg-gradient-to-br from-white/[0.01] to-transparent">
            <TypingCodeAnimation codeLines={codeLines} />
          </div>

          {/* Terminal Status Footer */}
          <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between backdrop-blur-md opacity-80">
            <div className="flex gap-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-[#00F5FF]/40 font-mono uppercase tracking-tighter">Status</span>
                <span className="text-[8px] text-white/50 font-mono uppercase">Operational</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-[#8B5CF6]/40 font-mono uppercase tracking-tighter">Region</span>
                <span className="text-[8px] text-white/50 font-mono uppercase">Global_S7</span>
              </div>
            </div>
            <div className="text-[9px] text-white/15 font-mono italic">v4.2.0</div>
          </div>
        </div>

        {/* 3D Decorative Assets */}
        <div className="absolute -top-6 -right-6 w-12 h-12 border-t-2 border-r-2 border-[#00F5FF]/20 rounded-tr-xl"></div>
        <div className="absolute -bottom-6 -left-6 w-12 h-12 border-b-2 border-l-2 border-[#8B5CF6]/20 rounded-bl-xl"></div>
      </motion.div>
    </div>
  );
};

// Syntax Highlighting Helper
const CodeLine = ({ line }) => {
  if (!line) return <span>&nbsp;</span>;

  // Very simple regex-based highlighting for C++
  const parts = line.split(/(\/\/.*|#include|using|namespace|int|main|cout|<<|".*?"|;|{|}|std)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('//')) return <span key={i} className="text-white/30 italic">{part}</span>;
        if (part.startsWith('"')) return <span key={i} className="text-[#a5c8ff]">{part}</span>;
        if (['int', 'using', 'namespace', 'std'].includes(part)) return <span key={i} className="text-[#22D3EE] font-black">{part}</span>;
        if (['#include', 'main', 'cout'].includes(part)) return <span key={i} className="text-[#8B5CF6] italic">{part}</span>;
        if (['<<', ';', '{', '}'].includes(part)) return <span key={i} className="text-white/40">{part}</span>;
        return <span key={i} className="text-white/80">{part}</span>;
      })}
    </span>
  );
};

export default RotatingCodeTerminal;
