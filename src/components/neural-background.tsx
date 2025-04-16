import { useEffect, useRef } from 'react';

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full viewport size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Neural network nodes and connections
    const nodes: {x: number; y: number; size: number; speed: number}[] = [];
    const connections: {from: number; to: number; opacity: number}[] = [];
    const nodeCount = Math.floor(canvas.width * canvas.height / 50000); // Adjust density

    // Create nodes with random positions and properties
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) { // Connect nodes that are close enough
          connections.push({
            from: i,
            to: j,
            opacity: 1 - distance / 150
          });
        }
      }
    }

    // Animation loop
    let animationFrameId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update node positions (slight movement)
      nodes.forEach((node, i) => {
        node.y += Math.sin(Date.now() * 0.001 + i) * node.speed;
        node.x += Math.cos(Date.now() * 0.001 + i) * node.speed;
        
        // Keep nodes within canvas
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;
      });
      
      // Draw connections
      connections.forEach(connection => {
        const fromNode = nodes[connection.from];
        const toNode = nodes[connection.to];
        
        const dx = fromNode.x - toNode.x;
        const dy = fromNode.y - toNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) { // Only draw if still close enough
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          
          const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const baseColor = isDarkMode ? 'rgba(155, 135, 245,' : 'rgba(155, 135, 245,';
          
          ctx.strokeStyle = `${baseColor}${connection.opacity * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
      
      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const baseColor = isDarkMode ? 'rgba(155, 135, 245,' : 'rgba(155, 135, 245,';
        
        ctx.fillStyle = `${baseColor}0.5)`;
        ctx.fill();
      });
      
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30"
    />
  );
}
