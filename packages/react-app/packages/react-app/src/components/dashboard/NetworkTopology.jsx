import React, { useEffect, useRef } from 'react';

const NetworkTopology = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes = [];
    const connections = [];
    const nodeCount = 15;

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 8 + 4,
        type: Math.random() > 0.7 ? 'hub' : 'node',
        load: Math.random()
      });
    }

    // Create connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) + 
          Math.pow(nodes[i].y - nodes[j].y, 2)
        );
        if (distance < 150) {
          connections.push({
            from: nodes[i],
            to: nodes[j],
            strength: 1 - (distance / 150)
          });
        }
      }
    }

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update node positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep nodes in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });

      // Draw connections
      connections.forEach(conn => {
        const distance = Math.sqrt(
          Math.pow(conn.from.x - conn.to.x, 2) + 
          Math.pow(conn.from.y - conn.to.y, 2)
        );
        
        if (distance < 150) {
          const alpha = conn.strength * (1 - distance / 150);
          ctx.strokeStyle = `rgba(255, 165, 0, ${alpha})`;
          ctx.lineWidth = Math.max(1, alpha * 3);
          ctx.beginPath();
          ctx.moveTo(conn.from.x, conn.from.y);
          ctx.lineTo(conn.to.x, conn.to.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const pulse = 0.5 + 0.5 * Math.sin(time + node.x * 0.01);
        const size = node.size * (1 + pulse * 0.3);
        
        if (node.type === 'hub') {
          // Draw hub nodes
          ctx.fillStyle = `rgba(255, 165, 0, ${0.8 + pulse * 0.2})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.stroke();

          // Draw hub rings
          ctx.strokeStyle = `rgba(255, 165, 0, ${0.3 + pulse * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Draw regular nodes
          ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + pulse * 0.4})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw load indicator
        const loadHeight = size * node.load;
        ctx.fillStyle = `rgba(0, 255, 0, ${0.8 + pulse * 0.2})`;
        ctx.fillRect(node.x - 2, node.y - size - 10, 4, -loadHeight);
      });

      time += 0.05;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

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
      <div className="absolute bottom-2 left-2 text-orange-400 text-xs">
        Network Topology Map
      </div>
    </div>
  );
};

export default NetworkTopology; 