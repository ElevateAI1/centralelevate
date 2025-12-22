import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect theme changes
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Redistribute particles on resize
      if (particlesRef.current.length > 0) {
        particlesRef.current.forEach((particle) => {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        });
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const particleCount = 40;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 3, // 3-6px (estrellas más grandes para que se vean)
        speedX: (Math.random() - 0.5) * 0.2, // Movimiento horizontal lento
        speedY: (Math.random() - 0.5) * 0.2, // Movimiento vertical lento
        opacity: Math.random() * 0.25 + 0.35, // 0.35-0.6 (más visible)
      });
    }

    particlesRef.current = particles;

    // Function to draw a star
    const drawStar = (x: number, y: number, radius: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      
      const spikes = 5; // 5-pointed star
      const outerRadius = radius;
      const innerRadius = radius * 0.5;
      let rot = (Math.PI / 2) * 3; // Start from top
      let xPos = 0;
      let yPos = 0;
      const step = Math.PI / spikes;

      // Start from top point
      xPos = Math.cos(rot) * outerRadius;
      yPos = Math.sin(rot) * outerRadius;
      ctx.moveTo(xPos, yPos);
      
      for (let i = 0; i < spikes; i++) {
        rot += step;
        xPos = Math.cos(rot) * innerRadius;
        yPos = Math.sin(rot) * innerRadius;
        ctx.lineTo(xPos, yPos);
        
        rot += step;
        xPos = Math.cos(rot) * outerRadius;
        yPos = Math.sin(rot) * outerRadius;
        ctx.lineTo(xPos, yPos);
      }
      
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseColor = isDark ? '255, 255, 255' : '0, 0, 0';

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw star
        drawStar(particle.x, particle.y, particle.size, `rgba(${baseColor}, ${particle.opacity})`);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDark]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 1,
        mixBlendMode: 'normal'
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          display: 'block'
        }}
      />
    </div>
  );
};

