import React, { useEffect, useRef } from 'react';

const TimeSeriesChart = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const dataPoints = [];
    const maxPoints = 100;
    let time = 0;

    // Generate initial data
    for (let i = 0; i < maxPoints; i++) {
      dataPoints.push({
        x: (i / maxPoints) * canvas.width,
        y: canvas.height / 2 + Math.sin(i * 0.1) * 30 + Math.random() * 20
      });
    }

    const drawChart = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update data points
      dataPoints.forEach((point, index) => {
        point.y = canvas.height / 2 + 
                  Math.sin(time + index * 0.1) * 30 + 
                  Math.sin(time * 0.5 + index * 0.05) * 15 +
                  Math.random() * 5;
      });

      // Draw line chart
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      dataPoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      // Draw area fill
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      dataPoints.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw data points
      dataPoints.forEach(point => {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw moving average
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < dataPoints.length - 5; i += 5) {
        const avgY = dataPoints.slice(i, i + 5).reduce((sum, p) => sum + p.y, 0) / 5;
        const x = dataPoints[i].x;
        if (i === 0) {
          ctx.moveTo(x, avgY);
        } else {
          ctx.lineTo(x, avgY);
        }
      }
      ctx.stroke();

      time += 0.02;
      animationRef.current = requestAnimationFrame(drawChart);
    };

    drawChart();

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
      <div className="absolute bottom-2 left-2 text-green-400 text-xs">
        Real-time Data Stream
      </div>
    </div>
  );
};

export default TimeSeriesChart; 