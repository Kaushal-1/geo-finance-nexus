
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

// Check if element is hero section to treat it specially
export const isHeroSection = (element: HTMLElement): boolean => {
  return element.id === 'hero' || element.classList.contains('hero-section');
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  return window.innerWidth < 768;
};
