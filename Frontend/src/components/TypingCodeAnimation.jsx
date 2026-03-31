import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TypingCodeAnimation = ({ codeLines }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines([]);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
        setIsTyping(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }

    if (isTyping) {
      if (currentCharIndex < codeLines[currentLineIndex].length) {
        const timeout = setTimeout(() => {
          setCurrentCharIndex((prev) => prev + 1);
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayedLines((prev) => [...prev, codeLines[currentLineIndex]]);
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
        }, 200);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentLineIndex, currentCharIndex, isTyping, codeLines]);

  return (
    <div className="space-y-1">
      {displayedLines.map((line, idx) => (
        <div key={idx} className="flex gap-4 min-h-[1.5rem]">
          <span className="text-white/10 select-none w-6 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
          <CodeLine line={line} />
        </div>
      ))}
      
      {currentLineIndex < codeLines.length && (
        <div className="flex gap-4 min-h-[1.5rem]">
          <span className="text-white/10 select-none w-6 text-right">{(currentLineIndex + 1).toString().padStart(2, '0')}</span>
          <div className="flex">
            <CodeLine line={codeLines[currentLineIndex].substring(0, currentCharIndex)} />
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2.5 h-5 bg-[#00F5FF]/80 ml-1 translate-y-0.5 shadow-[0_0_10px_rgba(0,245,255,0.5)]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CodeLine = ({ line }) => {
  if (!line) return <span>&nbsp;</span>;
  const parts = line.split(/(\/\/.*|#include|using|namespace|int|main|cout|<<|".*?"|;|{|}|std)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('//')) return <span key={i} className="text-white/30 italic">{part}</span>;
        if (part.startsWith('"')) return <span key={i} className="text-[#a5c8ff]">{part}</span>;
        if (['int', 'using', 'namespace', 'std'].includes(part)) return <span key={i} className="text-[#22D3EE] font-extrabold">{part}</span>;
        if (['#include', 'main', 'cout'].includes(part)) return <span key={i} className="text-[#8B5CF6] italic">{part}</span>;
        if (['<<', ';', '{', '}'].includes(part)) return <span key={i} className="text-white/40">{part}</span>;
        return <span key={i} className="text-white/80">{part}</span>;
      })}
    </span>
  );
};

export default TypingCodeAnimation;
