
import React, { useEffect, useRef, useState } from 'react';
import { getScrollProgress, getSectionVisibility, createRipple } from '@/utils/scrollAnimations';
import './scroll-animations.css';

interface ScrollAnimationsProps {
  sections: {
    id: string;
    name: string;
  }[];
}

const ScrollAnimations: React.FC<ScrollAnimationsProps> = ({ sections }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const pathRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement[]>([]);
  
  // Calculate node positions
  const nodePositions = sections.map((_, index) => 
    (index / (sections.length - 1)) * 100
  );

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const progress = getScrollProgress();
      setScrollProgress(progress);
      
      // Update progress bar
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
      
      // Update path line
      if (pathRef.current) {
        pathRef.current.style.height = `${progress * 100}%`;
      }
      
      // Find active section
      let maxVisibility = 0;
      let mostVisibleSection = sections[0].id;
      
      sections.forEach(section => {
        const visibility = getSectionVisibility(section.id);
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleSection = section.id;
        }
      });
      
      if (mostVisibleSection !== activeSection) {
        setActiveSection(mostVisibleSection);
      }
    };
    
    // Handle mouse move for magic dust effect
    const handleMouseMove = (e: MouseEvent) => {
      // Only create effects occasionally to prevent performance issues
      if (Math.random() > 0.92) {
        createDustParticle(e.clientX, e.clientY);
      }
    };
    
    // Create dust particles
    const createDustParticle = (x: number, y: number) => {
      const colors = ['#00b8d4', '#0052cc', '#8B5CF6', '#D946EF'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const dust = document.createElement('div');
      dust.classList.add('magic-dust');
      dust.style.left = `${x}px`;
      dust.style.top = `${y}px`;
      dust.style.backgroundColor = color;
      document.body.appendChild(dust);
      
      // Animate the dust
      const angle = Math.random() * Math.PI * 2; // Random direction
      const distance = 30 + Math.random() * 50; // Random distance
      const duration = 1000 + Math.random() * 2000; // Random duration
      
      const animation = dust.animate(
        [
          { 
            opacity: 0, 
            transform: 'scale(0.4) translate(0, 0)' 
          },
          { 
            opacity: 0.8, 
            transform: `scale(1) translate(${Math.cos(angle) * distance/3}px, ${Math.sin(angle) * distance/3}px)` 
          },
          { 
            opacity: 0, 
            transform: `scale(0.2) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)` 
          }
        ],
        {
          duration: duration,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
      );
      
      animation.onfinish = () => dust.remove();
    };
    
    // Apply global smooth scrolling
    document.documentElement.classList.add('smooth-scroll');
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll(); // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.classList.remove('smooth-scroll');
    };
  }, [sections, activeSection]);
  
  // Handle manual navigation via indicator
  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Create ripple effect at center of the dot
      const indicator = document.querySelector(`[data-section="${sectionId}"]`);
      if (indicator) {
        const rect = indicator.getBoundingClientRect();
        createRipple(rect.left, rect.top + rect.height / 2);
      }
      
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <>
      {/* Scroll progress bar */}
      <div className="scroll-progress" ref={progressRef} />
      
      {/* Path animation */}
      <div className="path-animation">
        <div className="path-line" ref={pathRef} />
        
        {/* Path nodes */}
        {sections.map((section, index) => (
          <div 
            key={section.id}
            className={`path-node ${activeSection === section.id ? 'active' : ''}`}
            style={{ top: `${nodePositions[index]}%` }}
            ref={node => {
              if (node) nodesRef.current[index] = node;
            }}
          />
        ))}
      </div>
      
      {/* Scroll indicators */}
      <div className="scroll-indicator">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className="scroll-indicator-item"
            onClick={() => navigateToSection(section.id)}
            data-section={section.id}
          >
            <div 
              className={`scroll-indicator-dot ${activeSection === section.id ? 'active' : ''}`}
            />
            <div className="scroll-indicator-label">{section.name}</div>
          </div>
        ))}
      </div>
      
      {/* Interactive background grid */}
      <div className="bg-grid" style={{ transform: `scale(${1 + scrollProgress * 0.1}) rotate(${scrollProgress * 3}deg)` }} />
    </>
  );
};

export default ScrollAnimations;
