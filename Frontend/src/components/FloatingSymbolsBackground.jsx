import React, { useEffect, useRef } from 'react';

const SYMBOLS = ['{}', '</>', '=>', '&&', '//', '::', '[]', '++', '01', '**'];
const COLORS = ['#38BDF8', '#22D3EE', '#818CF8'];

class Particle {
  constructor(canvasWidth, canvasHeight, isInitial = false) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset(isInitial);
  }

  reset(isInitial = false) {
    this.x = Math.random() * this.canvasWidth;
    this.y = isInitial ? Math.random() * this.canvasHeight : this.canvasHeight + 20;
    this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.fontSize = Math.floor(Math.random() * 7) + 12; // 12px to 18px
    this.speed = Math.random() * 0.7 + 0.3;
    this.swaySpeed = Math.random() * 0.02;
    this.swayAmount = Math.random() * 0.5;
    this.swayOffset = Math.random() * Math.PI * 2;
    this.maxAlpha = Math.random() * 0.18 + 0.10; // 0.10 to 0.28
    this.alpha = 0;
  }

  update() {
    this.y -= this.speed;
    this.x += Math.sin(this.swayOffset + (this.y * this.swaySpeed)) * this.swayAmount;

    // Fade in from bottom, fade out toward top
    // Reduced fadeZone so symbols stay at maxAlpha longer
    const fadeZone = 60;
    if (this.y > this.canvasHeight - fadeZone) {
      this.alpha = ((this.canvasHeight - this.y) / fadeZone) * this.maxAlpha;
    } else if (this.y < fadeZone) {
      this.alpha = (this.y / fadeZone) * this.maxAlpha;
    } else {
      this.alpha = this.maxAlpha;
    }

    if (this.y < -20) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.font = `${this.fontSize}px "JetBrains Mono", monospace`;
    ctx.fillText(this.symbol, this.x, this.y);
  }
}

const FloatingSymbolsBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particleCount = window.innerWidth < 768 ? 25 : 60;
      particles = Array.from({ length: particleCount }).map(() => new Particle(canvas.width, canvas.height, true));
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(render);
    };

    initCanvas();
    render();

    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default FloatingSymbolsBackground;
