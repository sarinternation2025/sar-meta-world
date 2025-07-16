import React, { useEffect, useRef } from 'react';

const AdvancedCharts = () => {
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

    const drawAdvancedChart = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw radar chart
      const radius = Math.min(canvas.width, canvas.height) * 0.3;
      const points = 6;
      
      // Draw radar grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      
      for (let i = 1; i <= 5; i++) {
        const currentRadius = (radius / 5) * i;
        ctx.beginPath();
        for (let j = 0; j < points; j++) {
          const angle = (j / points) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * currentRadius;
          const y = centerY + Math.sin(angle) * currentRadius;
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw radar spokes
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Draw data polygon
      const data = [
        0.8 + 0.2 * Math.sin(time),
        0.6 + 0.3 * Math.sin(time + 1),
        0.9 + 0.1 * Math.sin(time + 2),
        0.7 + 0.2 * Math.sin(time + 3),
        0.8 + 0.2 * Math.sin(time + 4),
        0.6 + 0.3 * Math.sin(time + 5)
      ];

      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const distance = radius * data[i];
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw data points
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const distance = radius * data[i];
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      time += 0.02;
      animationRef.current = requestAnimationFrame(drawAdvancedChart);
    };

    drawAdvancedChart();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute bottom-2 left-2 text-cyan-400 text-xs">
        Advanced Analytics
      </div>
    </div>
  );
};

export default AdvancedCharts; 