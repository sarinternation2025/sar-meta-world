import React, { useEffect, useRef } from 'react';

const QuantumMetrics = ({ entropy = 0.847 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;

    const drawQuantumStates = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw quantum superposition
      const radius = Math.min(canvas.width, canvas.height) * 0.3;
      
      // Draw multiple quantum states
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time;
        const distance = radius * (0.2 + 0.8 * Math.sin(time + i * 0.5));
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        const size = 4 + Math.sin(time + i) * 4;
        const alpha = 0.3 + 0.4 * Math.sin(time + i * 0.7);
        
        ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw entanglement lines
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const angle1 = (i / 4) * Math.PI * 2 + time;
        const angle2 = ((i + 2) / 4) * Math.PI * 2 + time;
        
        const x1 = centerX + Math.cos(angle1) * radius * 0.6;
        const y1 = centerY + Math.sin(angle1) * radius * 0.6;
        const x2 = centerX + Math.cos(angle2) * radius * 0.6;
        const y2 = centerY + Math.sin(angle2) * radius * 0.6;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw entropy measurement
      const entropyBarWidth = canvas.width * 0.8;
      const entropyBarHeight = 8;
      const entropyBarX = (canvas.width - entropyBarWidth) / 2;
      const entropyBarY = centerY + radius + 20;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(entropyBarX, entropyBarY, entropyBarWidth, entropyBarHeight);
      
      ctx.fillStyle = `rgba(255, 0, 255, ${0.6 + 0.4 * Math.sin(time * 2)})`;
      ctx.fillRect(entropyBarX, entropyBarY, entropyBarWidth * entropy, entropyBarHeight);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(entropyBarX, entropyBarY, entropyBarWidth, entropyBarHeight);

      // Draw quantum wave function
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 2) {
        const waveX = x;
        const waveY = centerY + Math.sin(x * 0.02 + time * 3) * 20 + Math.sin(x * 0.01 + time) * 10;
        if (x === 0) {
          ctx.moveTo(waveX, waveY);
        } else {
          ctx.lineTo(waveX, waveY);
        }
      }
      ctx.stroke();

      time += 0.03;
      animationRef.current = requestAnimationFrame(drawQuantumStates);
    };

    drawQuantumStates();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [entropy]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute bottom-2 left-2 text-purple-400 text-xs">
        Quantum Entropy: {(entropy * 100).toFixed(1)}%
      </div>
    </div>
  );
};

export default QuantumMetrics; 