
/**
 * Utility functions for scroll animations
 */

// Get scroll progress as percentage
export const getScrollProgress = (): number => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  return scrollTop / Math.max(scrollHeight, 1); // Prevent division by zero
};

// Get section visibility percentage with improved detection
export const getSectionVisibility = (sectionId: string): number => {
  const element = document.getElementById(sectionId);
  if (!element) return 0;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // If element is not in viewport
  if (rect.bottom < 0 || rect.top > windowHeight) return 0;
  
  // If element is fully in viewport
  if (rect.top >= 0 && rect.bottom <= windowHeight) return 1;
  
  // If element is partially in viewport - improved algorithm with bias toward center
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const elementHeight = rect.height;
  
  // Base visibility on ratio
  let visibility = Math.min(visibleHeight / elementHeight, 1);
  
  // Bias toward elements in the center of the viewport
  const elementCenter = rect.top + elementHeight / 2;
  const viewportCenter = windowHeight / 2;
  const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
  const maxDistance = windowHeight / 2;
  
  // Apply center bias (elements closer to center get slightly higher visibility)
  const centerBias = 1 - (distanceFromCenter / maxDistance) * 0.3;
  visibility *= centerBias;
  
  return Math.min(visibility, 1);
};

// Get relative position for parallax effect with improved smoothness
export const getParallaxPosition = (
  element: HTMLElement, 
  speed: number = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
): number => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  
  if (direction === 'vertical') {
    const centerPosition = rect.top + rect.height / 2;
    const fromCenter = centerPosition - windowHeight / 2;
    
    // Apply easing to make movement smoother
    const easedPosition = Math.sign(fromCenter) * Math.pow(Math.abs(fromCenter), 0.85);
    return -easedPosition * speed;
  } else {
    const centerPosition = rect.left + rect.width / 2;
    const fromCenter = centerPosition - windowWidth / 2;
    
    // Apply easing to make movement smoother
    const easedPosition = Math.sign(fromCenter) * Math.pow(Math.abs(fromCenter), 0.85);
    return -easedPosition * speed;
  }
};

// Apply smooth transform to element based on scroll position with enhanced smoothing
export const applySmoothTransform = (
  element: HTMLElement, 
  scrollProgress: number, 
  { 
    translateY = 0, 
    translateX = 0,
    opacity = 1, 
    scale = 1, 
    rotation = 0,
    blur = 0
  }: { 
    translateY?: number; 
    translateX?: number;
    opacity?: number; 
    scale?: number; 
    rotation?: number;
    blur?: number;
  } = {}
): void => {
  if (!element) return;
  
  element.style.transform = `translateY(${translateY}px) translateX(${translateX}px) scale(${scale}) rotate(${rotation}deg)`;
  element.style.opacity = opacity.toString();
  
  if (blur > 0) {
    element.style.filter = `blur(${blur}px)`;
  } else {
    element.style.filter = '';
  }
};

// Create ripple effect - improved with better rendering performance
export const createRipple = (x: number, y: number, color: string = '#00b8d4'): void => {
  const ripple = document.createElement('div');
  
  ripple.className = 'absolute rounded-full pointer-events-none';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.backgroundColor = color;
  ripple.style.transform = 'translate(-50%, -50%) scale(0)';
  ripple.style.width = '2px';
  ripple.style.height = '2px';
  ripple.style.opacity = '0.6'; // Reduced opacity
  
  document.body.appendChild(ripple);
  
  // Animate the ripple with more efficient options
  const animation = ripple.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.6 },
      { transform: 'translate(-50%, -50%) scale(250)', opacity: 0 }
    ],
    {
      duration: 800, // Faster animation
      easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      composite: 'add' // More efficient compositing
    }
  );
  
  animation.onfinish = () => {
    ripple.remove();
  };
};

// Create hero particles effect
export const createHeroParticles = (container: HTMLElement): void => {
  if (!container) return;
  
  // Clear any existing particles
  const existingParticles = container.querySelectorAll('.hero-particle');
  existingParticles.forEach(p => p.remove());
  
  // Create new particles
  const particleCount = window.innerWidth < 768 ? 30 : 60; // Less particles on mobile
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('hero-particle');
    
    // Randomize size (smaller for a more sophisticated look)
    const size = 1 + Math.random() * 3;
    
    // Randomize color with a bias towards the teal spectrum for brand consistency
    const colors = ['#00b8d4', '#00d4d4', '#00d4b8', '#ffffff', '#b8e6ff'];
    const colorIndex = Math.floor(Math.pow(Math.random(), 1.5) * colors.length); // Bias towards first colors
    const color = colors[colorIndex];
    
    // Randomize opacity for depth
    const opacity = 0.1 + Math.random() * 0.7;
    
    // Position randomly within container
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Set CSS properties
    particle.style.position = 'absolute';
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.opacity = `${opacity}`;
    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    
    // Add animation
    const duration = 15 + Math.random() * 20;
    const delay = Math.random() * -30; // Negative delay for immediate start
    particle.style.animation = `float-particle ${duration}s ${delay}s infinite ease-in-out`;
    
    container.appendChild(particle);
  }
};

// Apply hero constellation effect
export const createHeroConstellation = (container: HTMLElement): (() => void) => {
  if (!container) return () => {};
  
  // Create canvas for lines
  const canvas = document.createElement('canvas');
  canvas.classList.add('hero-constellation');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  container.appendChild(canvas);
  
  // Setup canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  
  // Create particle nodes
  const nodes: {x: number, y: number, vx: number, vy: number, radius: number}[] = [];
  const nodeCount = window.innerWidth < 768 ? 40 : 100;
  const connectionDistance = window.innerWidth < 768 ? 100 : 150;
  
  const resizeCanvas = () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };
  
  // Initialize nodes
  const initNodes = () => {
    nodes.length = 0;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 0.2 - 0.1,
        vy: Math.random() * 0.2 - 0.1,
        radius: 1 + Math.random() * 2
      });
    }
  };
  
  // Draw function
  const draw = () => {
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Update position
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      
      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 184, 212, ${0.1 + Math.random() * 0.1})`;
      ctx.fill();
      
      // Draw connections
      for (let j = i + 1; j < nodes.length; j++) {
        const node2 = nodes[j];
        const dx = node.x - node2.x;
        const dy = node.y - node2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(node2.x, node2.y);
          
          // Opacity based on distance
          const opacity = 1 - distance / connectionDistance;
          ctx.strokeStyle = `rgba(0, 184, 212, ${opacity * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };
  
  // Handle resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    initNodes();
  });
  
  // Initial setup
  resizeCanvas();
  initNodes();
  
  // Animation frame
  let animationId: number;
  const animate = () => {
    draw();
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationId);
    canvas.remove();
  };
};

// Check if element is hero section to treat it specially
export const isHeroSection = (element: HTMLElement): boolean => {
  return element.id === 'hero' || element.classList.contains('hero-section');
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  return window.innerWidth < 768;
};
