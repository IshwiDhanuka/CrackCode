import React from 'react';
import { motion } from 'framer-motion';

const GradientButton = ({ children, onClick, className = "" }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`group relative px-8 py-4 bg-gradient-to-r from-[#00F5FF] via-[#3B82F6] to-[#8B5CF6] text-black font-black rounded-xl transition-all shadow-[0_0_30px_rgba(0,245,255,0.2)] hover:shadow-[0_0_50px_rgba(0,245,255,0.4)] ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
    </motion.button>
  );
};

export default GradientButton;
