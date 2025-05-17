
/**
 * Utility functions for scroll animations
 */

// Get scroll progress as percentage
export const getScrollProgress = (): number => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  return scrollTop / scrollHeight;
};

// Get section visibility percentage
export const getSectionVisibility = (sectionId: string): number => {
  const element = document.getElementById(sectionId);
  if (!element) return 0;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // If element is not in viewport
  if (rect.bottom < 0 || rect.top > windowHeight) return 0;
  
  // If element is fully in viewport
  if (rect.top >= 0 && rect.bottom <= windowHeight) return 1;
  
  // If element is partially in viewport
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const elementHeight = rect.height;
  
  return Math.min(visibleHeight / elementHeight, 1);
};

// Get relative position for parallax effect
export const getParallaxPosition = (element: HTMLElement, speed: number = 0.5): number => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const centerPosition = rect.top + rect.height / 2;
  const fromCenter = centerPosition - windowHeight / 2;
  
  return -fromCenter * speed;
};

// Apply smooth transform to element based on scroll position
export const applySmoothTransform = (
  element: HTMLElement, 
  scrollProgress: number, 
  { 
    translateY = 0, 
    opacity = 1, 
    scale = 1, 
    rotation = 0 
  }: { 
    translateY?: number; 
    opacity?: number; 
    scale?: number; 
    rotation?: number; 
  } = {}
): void => {
  if (!element) return;
  
  element.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`;
  element.style.opacity = opacity.toString();
};

// Create ripple effect
export const createRipple = (x: number, y: number, color: string = '#00b8d4'): void => {
  const ripple = document.createElement('div');
  
  ripple.className = 'absolute rounded-full pointer-events-none';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.backgroundColor = color;
  ripple.style.transform = 'translate(-50%, -50%) scale(0)';
  ripple.style.width = '2px';
  ripple.style.height = '2px';
  ripple.style.opacity = '0.8';
  
  document.body.appendChild(ripple);
  
  // Animate the ripple
  const animation = ripple.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.8 },
      { transform: 'translate(-50%, -50%) scale(300)', opacity: 0 }
    ],
    {
      duration: 1000,
      easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
    }
  );
  
  animation.onfinish = () => {
    ripple.remove();
  };
};
