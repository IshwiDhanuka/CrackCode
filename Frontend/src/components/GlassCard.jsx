import React from 'react';

const GlassCard = ({ children, className = "", accentColor = "from-[#00F5FF] via-[#3B82F6] to-[#8B5CF6]" }) => {
  return (
    <div className={`relative group transition-all duration-300 hover:translate-y-[-6px] hover:scale-[1.02] ${className}`}>
      {/* Premium Glow Layer */}
      <div className={`absolute -inset-[1px] bg-gradient-to-r ${accentColor} rounded-[20px] blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
      
      {/* Main card body */}
      <div className="relative h-full bg-[#0f172a]/70 backdrop-blur-[12px] border border-white/10 rounded-[20px] overflow-hidden flex flex-col items-start shadow-2xl">
        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${accentColor} opacity-80`}></div>
        
        {/* Content Wrapper */}
        <div className="w-full h-full p-8 flex flex-col gap-6">
          {/* Animated Internal Highlight */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlassCard;
