
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Create particles
    const particles: Particle[] = [];
    const particleCount = Math.floor(window.innerWidth / 10); // Adjust density

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1 + 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      drawGrid(ctx, canvas);
      
      // Draw particles
      particles.forEach((particle, index) => {
        // Update particle position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Reset position if out of bounds
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.x = Math.random() * canvas.width;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.y = Math.random() * canvas.height;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 184, 212, ${particle.opacity})`;
        ctx.fill();
        
        // Connect nearby particles
        connectParticles(particles, index, ctx);
      });
      
      requestAnimationFrame(animate);
    };
    
    // Draw grid lines function
    const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const time = Date.now() * 0.0005;
      const gridSize = 70;
      
      ctx.strokeStyle = 'rgba(0, 184, 212, 0.1)';
      ctx.lineWidth = 0.3;
      
      // Horizontal lines
      for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        
        // Add a pulse effect to some lines
        if (i % (gridSize * 2) === 0) {
          const pulse = Math.sin(time + i * 0.01) * 0.1 + 0.2;
          ctx.strokeStyle = `rgba(0, 184, 212, ${pulse})`;
        } else {
          ctx.strokeStyle = 'rgba(0, 184, 212, 0.05)';
        }
        
        ctx.stroke();
      }
      
      // Vertical lines
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        
        // Add a pulse effect to some lines
        if (i % (gridSize * 3) === 0) {
          const pulse = Math.sin(time + i * 0.01) * 0.1 + 0.2;
          ctx.strokeStyle = `rgba(0, 184, 212, ${pulse})`;
        } else {
          ctx.strokeStyle = 'rgba(0, 184, 212, 0.05)';
        }
        
        ctx.stroke();
      }
    };
    
    // Connect particles if they're close enough
    const connectParticles = (particles: Particle[], index: number, ctx: CanvasRenderingContext2D) => {
      const currentParticle = particles[index];
      
      for (let i = index + 1; i < particles.length; i++) {
        const targetParticle = particles[i];
        const dx = currentParticle.x - targetParticle.x;
        const dy = currentParticle.y - targetParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) { // Connection distance threshold
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 184, 212, ${0.1 * (1 - distance / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(currentParticle.x, currentParticle.y);
          ctx.lineTo(targetParticle.x, targetParticle.y);
          ctx.stroke();
        }
      }
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full bg-transparent"
    />
  );
};

export default ParticleField;
