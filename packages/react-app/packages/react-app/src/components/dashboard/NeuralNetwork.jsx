import React, { useEffect, useRef } from 'react';

const NeuralNetwork = () => {
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
    const layers = 4;
    const nodesPerLayer = [3, 5, 4, 2];

    // Initialize nodes
    for (let layer = 0; layer < layers; layer++) {
      const layerNodes = [];
      for (let i = 0; i < nodesPerLayer[layer]; i++) {
        const x = (canvas.width / (layers - 1)) * layer;
        const y = (canvas.height / (nodesPerLayer[layer] + 1)) * (i + 1);
        layerNodes.push({
          x,
          y,
          activation: Math.random(),
          bias: Math.random() - 0.5
        });
      }
      nodes.push(layerNodes);
    }

    // Create connections
    for (let layer = 0; layer < layers - 1; layer++) {
      for (let i = 0; i < nodes[layer].length; i++) {
        for (let j = 0; j < nodes[layer + 1].length; j++) {
          connections.push({
            from: nodes[layer][i],
            to: nodes[layer + 1][j],
            weight: Math.random() - 0.5
          });
        }
      }
    }

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update node activations
      nodes.forEach(layer => {
        layer.forEach(node => {
          node.activation = 0.5 + 0.5 * Math.sin(time + node.x * 0.01);
        });
      });

      // Draw connections
      connections.forEach(conn => {
        const intensity = Math.abs(conn.weight) * conn.from.activation * conn.to.activation;
        ctx.strokeStyle = `rgba(0, 255, 255, ${intensity * 0.8})`;
        ctx.lineWidth = Math.max(1, intensity * 3);
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(layer => {
        layer.forEach(node => {
          const size = 8 + node.activation * 8;
          const alpha = 0.6 + node.activation * 0.4;
          
          ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.stroke();
        });
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
      <div className="absolute bottom-2 left-2 text-cyan-400 text-xs">
        Neural Network Visualization
      </div>
    </div>
  );
};

export default NeuralNetwork; 