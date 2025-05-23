
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const frameRef = useRef<number>();
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current = renderer;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200; // Increased particle count
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create gradient particles with different colors
    const particlesMaterial1 = new THREE.PointsMaterial({
      size: 0.008,
      color: '#00D4FF',
      transparent: true,
      opacity: 0.8,
    });
    
    const particlesMaterial2 = new THREE.PointsMaterial({
      size: 0.006,
      color: '#9900FF',
      transparent: true,
      opacity: 0.7,
    });
    
    const particlesMaterial3 = new THREE.PointsMaterial({
      size: 0.004,
      color: '#FF1493',
      transparent: true,
      opacity: 0.6,
    });

    // Create three particle systems with different materials
    const particlesMesh1 = new THREE.Points(particlesGeometry.clone(), particlesMaterial1);
    const particlesMesh2 = new THREE.Points(particlesGeometry.clone(), particlesMaterial2);
    const particlesMesh3 = new THREE.Points(particlesGeometry.clone(), particlesMaterial3);
    
    scene.add(particlesMesh1);
    scene.add(particlesMesh2);
    scene.add(particlesMesh3);

    // Create geometric shapes
    const shapes: THREE.Mesh[] = [];
    
    // Torus
    const torusGeometry = new THREE.TorusGeometry(3, 0.5, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({ 
      color: '#8B5CF6', 
      wireframe: true, 
      transparent: true, 
      opacity: 0.4
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-10, 5, -20);
    scene.add(torus);
    shapes.push(torus);

    // Icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(2, 0);
    const icoMaterial = new THREE.MeshBasicMaterial({ 
      color: '#00FFCC', 
      wireframe: true, 
      transparent: true, 
      opacity: 0.5
    });
    const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    icosahedron.position.set(15, -8, -25);
    scene.add(icosahedron);
    shapes.push(icosahedron);

    // Octahedron
    const octaGeometry = new THREE.OctahedronGeometry(1.5);
    const octaMaterial = new THREE.MeshBasicMaterial({ 
      color: '#FF1493', 
      wireframe: true, 
      transparent: true, 
      opacity: 0.4
    });
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    octahedron.position.set(8, 10, -15);
    scene.add(octahedron);
    shapes.push(octahedron);
    
    // Dodecahedron - new shape
    const dodecaGeometry = new THREE.DodecahedronGeometry(2);
    const dodecaMaterial = new THREE.MeshBasicMaterial({ 
      color: '#FFD700', 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3
    });
    const dodecahedron = new THREE.Mesh(dodecaGeometry, dodecaMaterial);
    dodecahedron.position.set(-12, -7, -20);
    scene.add(dodecahedron);
    shapes.push(dodecahedron);

    camera.position.z = 10;

    // Track mouse movement
    const updateMousePosition = (e: MouseEvent) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };

    window.addEventListener('mousemove', updateMousePosition);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Rotate particles
      particlesMesh1.rotation.y += 0.0005;
      particlesMesh1.rotation.x += 0.0002;
      
      particlesMesh2.rotation.y -= 0.0003;
      particlesMesh2.rotation.z += 0.0004;
      
      particlesMesh3.rotation.x -= 0.0004;
      particlesMesh3.rotation.z -= 0.0002;

      // Move particles based on mouse position
      particlesMesh1.position.x = mousePosition.current.x * 0.5;
      particlesMesh1.position.y = mousePosition.current.y * 0.5;
      
      // Animate shapes
      shapes.forEach((shape, index) => {
        // Different rotation speeds for each shape
        shape.rotation.x += 0.005 * (index + 1);
        shape.rotation.y += 0.003 * (index + 1);
        
        // More pronounced wave effect
        shape.position.y += Math.sin(Date.now() * 0.001 + index * 1.5) * 0.01;
        
        // Add subtle mouse influence to shape positions
        shape.position.x += (mousePosition.current.x * 0.01) * (index % 2 ? 1 : -1);
        shape.position.y += (mousePosition.current.y * 0.01) * (index % 2 ? -1 : 1);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', updateMousePosition);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};

export default ThreeBackground;
