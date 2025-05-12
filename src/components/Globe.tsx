
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GlobeProps {
  className?: string;
}

// Financial centers with coordinates [longitude, latitude]
const financialCenters = [
  { name: 'New York', position: [-74.0060, 40.7128], size: 0.7 },
  { name: 'London', position: [-0.1278, 51.5074], size: 0.7 },
  { name: 'Tokyo', position: [139.6503, 35.6762], size: 0.7 },
  { name: 'Hong Kong', position: [114.1694, 22.3193], size: 0.6 },
  { name: 'Singapore', position: [103.8198, 1.3521], size: 0.6 },
  { name: 'Shanghai', position: [121.4737, 31.2304], size: 0.6 },
  { name: 'Frankfurt', position: [8.6821, 50.1109], size: 0.5 },
  { name: 'Sydney', position: [151.2093, -33.8688], size: 0.5 },
  { name: 'Dubai', position: [55.2708, 25.2048], size: 0.5 },
  { name: 'Mumbai', position: [72.8777, 19.0760], size: 0.5 },
  { name: 'São Paulo', position: [-46.6333, -23.5505], size: 0.5 },
];

// Connections between financial centers for data flow lines
const connections = [
  ['New York', 'London'],
  ['London', 'Frankfurt'],
  ['New York', 'Hong Kong'],
  ['Tokyo', 'Hong Kong'],
  ['Singapore', 'Hong Kong'],
  ['London', 'Dubai'],
  ['Shanghai', 'Tokyo'],
  ['Mumbai', 'Dubai'],
  ['Singapore', 'Sydney'],
  ['New York', 'São Paulo'],
];

const Globe = ({ className }: GlobeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Convert lat/long to 3D coordinates
  const latLongToVector3 = (lat: number, long: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 250;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Globe setup
    const radius = 100;
    const globeGeometry = new THREE.SphereGeometry(radius, 64, 64);
    
    // Earth texture with dark theme
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a1929,
      opacity: 0.9,
      transparent: true,
      wireframe: true,
    });
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    
    // Add outer glow
    const glowGeometry = new THREE.SphereGeometry(radius + 1, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00b8d4,
      opacity: 0.05,
      transparent: true,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Add another layer with different opacity
    const glowGeometry2 = new THREE.SphereGeometry(radius + 3, 64, 64);
    const glowMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x00b8d4,
      opacity: 0.025,
      transparent: true,
    });
    const glowMesh2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
    scene.add(glowMesh2);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add financial centers as glowing dots
    const financialCenterGroup = new THREE.Group();
    
    financialCenters.forEach((center) => {
      const position = latLongToVector3(center.position[1], center.position[0], radius);
      
      // Glowing point
      const dotGeometry = new THREE.SphereGeometry(center.size, 16, 16);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: 0x00b8d4,
        opacity: 0.8,
        transparent: true,
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(position.x, position.y, position.z);
      
      // Add glow effect
      const glowSize = center.size * 2;
      const pointGlowGeometry = new THREE.SphereGeometry(glowSize, 16, 16);
      const pointGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00b8d4,
        opacity: 0.3,
        transparent: true,
      });
      const pointGlow = new THREE.Mesh(pointGlowGeometry, pointGlowMaterial);
      pointGlow.position.set(position.x, position.y, position.z);
      
      financialCenterGroup.add(dot);
      financialCenterGroup.add(pointGlow);
      
      // Store position on the dot
      dot.userData = { name: center.name, position };
    });
    
    scene.add(financialCenterGroup);
    
    // Add connection lines between financial centers
    const lineGroup = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00b8d4,
      opacity: 0.3,
      transparent: true,
      linewidth: 1,
    });
    
    connections.forEach(([fromName, toName]) => {
      const fromCenter = financialCenters.find(c => c.name === fromName);
      const toCenter = financialCenters.find(c => c.name === toName);
      
      if (fromCenter && toCenter) {
        const fromPosition = latLongToVector3(fromCenter.position[1], fromCenter.position[0], radius);
        const toPosition = latLongToVector3(toCenter.position[1], toCenter.position[0], radius);
        
        // Create a curved line between points
        const curvePoints = [];
        for (let i = 0; i <= 20; i++) {
          const p = i / 20;
          const midPoint = new THREE.Vector3().lerpVectors(fromPosition, toPosition, p);
          // Add curve by lifting the middle points
          const liftAmount = 5 + (fromPosition.distanceTo(toPosition) * 0.05);
          if (p > 0.1 && p < 0.9) {
            const lift = Math.sin(p * Math.PI) * liftAmount;
            midPoint.normalize().multiplyScalar(radius + lift);
          } else {
            midPoint.normalize().multiplyScalar(radius);
          }
          curvePoints.push(midPoint);
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        lineGroup.add(line);
      }
    });
    
    scene.add(lineGroup);
    
    // Animation loop
    let animationId: number;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationSpeed = 0.001;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (!isDragging) {
        globe.rotation.y += rotationSpeed;
        financialCenterGroup.rotation.y += rotationSpeed;
        lineGroup.rotation.y += rotationSpeed;
      }
      
      // Pulsating effect for glowing points
      const pulse = Math.sin(Date.now() * 0.002) * 0.2 + 0.8;
      financialCenterGroup.children.forEach((child, index) => {
        if (index % 2 === 1) { // Apply only to glow meshes
          child.scale.set(pulse, pulse, pulse);
        }
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Handle mouse interactions
    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y,
        };
        
        globe.rotation.y += deltaMove.x * 0.005;
        globe.rotation.x += deltaMove.y * 0.005;
        financialCenterGroup.rotation.y += deltaMove.x * 0.005;
        financialCenterGroup.rotation.x += deltaMove.y * 0.005;
        lineGroup.rotation.y += deltaMove.x * 0.005;
        lineGroup.rotation.x += deltaMove.y * 0.005;
        
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY,
        };
      }
    };
    
    const handleMouseUp = () => {
      isDragging = false;
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup function
    return () => {
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return <div ref={containerRef} className={`h-full w-full ${className || ''}`} />;
};

export default Globe;
