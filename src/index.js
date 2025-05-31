// src/index.js

// Import React and ReactDOM from installed packages
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// Import Three.js from installed package
import * as THREE from 'three';

// Helper function to check for WebGL support
// This function is executed once when the script loads.
const webGLSupported = (() => {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
})();

/**
 * Interactive3DWidget React Component
 * A responsive 3D cube that rotates continuously and responds to mouse movement.
 * 
 * @param {object} props - Component props
 * @param {number} props.width - Container width in pixels
 * @param {number} props.height - Container height in pixels
 * @param {number} props.rotationSpeed - Speed of continuous rotation
 */
const Interactive3DWidget = ({ width = 600, height = 400, rotationSpeed }) => {
    // Refs for Three.js elements
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const cubeRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetRotationRef = useRef({ x: 0, y: 0 });
    const isInitializedRef = useRef(false);

    // Component state
    const [isLoading, setIsLoading] = useState(true);
    const [isWebGLSupported] = useState(webGLSupported);
    const [hoverEffect, setHoverEffect] = useState(false);

    // Initialize Three.js scene
    useEffect(() => {
        if (!isWebGLSupported || isInitializedRef.current) {
            setIsLoading(false);
            return;
        }

        const currentMount = mountRef.current;
        if (!currentMount) return;

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x1a1a2e);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 3.5;
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        while (currentMount.firstChild) {
            currentMount.removeChild(currentMount.firstChild);
        }
        currentMount.appendChild(renderer.domElement);

        // Enhanced lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(5, 5, 5);
        directionalLight1.castShadow = true;
        directionalLight1.shadow.mapSize.width = 1024;
        directionalLight1.shadow.mapSize.height = 1024;
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x00bcd4, 0.5);
        directionalLight2.position.set(-5, -5, 5);
        scene.add(directionalLight2);

        // Enhanced cube setup with texture
        const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00bcd4,
            roughness: 0.2,
            metalness: 0.6,
            envMapIntensity: 1.0
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cubeRef.current = cube;
        scene.add(cube);

        // Shadow plane
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;
        plane.position.y = -2;
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);

        // Mouse interaction
        const handleMouseMove = (event) => {
            if (!currentMount) return;
            const rect = currentMount.getBoundingClientRect();
            const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

            mouseRef.current.x = mouseX;
            mouseRef.current.y = mouseY;

            // Smooth tilt response
            targetRotationRef.current.x = mouseY * 0.4;
            targetRotationRef.current.y = mouseX * 0.4;

            setHoverEffect(true);
        };

        const handleMouseLeave = () => {
            targetRotationRef.current.x = 0;
            targetRotationRef.current.y = 0;
            setHoverEffect(false);
        };

        currentMount.addEventListener('mousemove', handleMouseMove);
        currentMount.addEventListener('mouseleave', handleMouseLeave);

        // Animation loop
        const animate = () => {
            if (!cubeRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

            // Continuous Y-axis rotation
            cubeRef.current.rotation.y += rotationSpeed;

            // Smooth tilt interpolation
            const tiltSpeed = 0.1;
            cubeRef.current.rotation.x += (targetRotationRef.current.x - cubeRef.current.rotation.x) * tiltSpeed;
            cubeRef.current.rotation.z += (targetRotationRef.current.y - cubeRef.current.rotation.z) * tiltSpeed;

            // Subtle hover effect
            const targetScale = hoverEffect ? 1.05 : 1.0;
            cubeRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            rendererRef.current.render(sceneRef.current, cameraRef.current);
            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        // Start animation after a short delay
        const startDelay = setTimeout(() => {
            setIsLoading(false);
            isInitializedRef.current = true;
            if (isWebGLSupported) animate();
        }, 800);

        // Resize handler
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current && currentMount) {
                const newWidth = currentMount.clientWidth;
                const newHeight = currentMount.clientHeight;

                cameraRef.current.aspect = newWidth / newHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(newWidth, newHeight);
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(currentMount);

        // Cleanup
        return () => {
            clearTimeout(startDelay);
            cancelAnimationFrame(animationFrameIdRef.current);
            
            if (currentMount) {
                currentMount.removeEventListener('mousemove', handleMouseMove);
                currentMount.removeEventListener('mouseleave', handleMouseLeave);
                resizeObserver.unobserve(currentMount);
            }
            
            if (rendererRef.current) {
                if (currentMount && rendererRef.current.domElement && currentMount.contains(rendererRef.current.domElement)) {
                    currentMount.removeChild(rendererRef.current.domElement);
                }
                rendererRef.current.dispose();
            }
            if (sceneRef.current) {
                sceneRef.current.traverse(object => {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }
            isInitializedRef.current = false;
        };
    }, [isWebGLSupported]); // Only run on mount and WebGL support change

    // Handle rotation speed changes
    useEffect(() => {
        if (!isInitializedRef.current) return;
        
        const animate = () => {
            if (!cubeRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
            
            // Continuous Y-axis rotation with current speed
            cubeRef.current.rotation.y += rotationSpeed;
            
            // Smooth tilt interpolation
            const tiltSpeed = 0.1;
            cubeRef.current.rotation.x += (targetRotationRef.current.x - cubeRef.current.rotation.x) * tiltSpeed;
            cubeRef.current.rotation.z += (targetRotationRef.current.y - cubeRef.current.rotation.z) * tiltSpeed;
            
            // Subtle hover effect
            const targetScale = hoverEffect ? 1.05 : 1.0;
            cubeRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
            
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            animationFrameIdRef.current = requestAnimationFrame(animate);
        };
        
        // Start animation if not already running
        if (!animationFrameIdRef.current) {
            animate();
        }
        
        // Cleanup
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
        };
    }, [rotationSpeed, hoverEffect]); // Added hoverEffect to dependencies

    // WebGL not supported fallback
    if (!isWebGLSupported) {
        return (
            <div className="widget-container" style={{ 
                width: `${width}px`, 
                height: `${height}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(26, 26, 46, 0.8)',
                borderRadius: '15px',
                color: '#fff'
            }}>
                <div className="fallback-message" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2em', marginBottom: '10px' }}><strong>WebGL Not Supported</strong></p>
                    <p>Please use a modern browser that supports WebGL</p>
                </div>
            </div>
        );
    }

    return (
        <div className="widget-container" style={{ 
            width: `${width}px`, 
            height: `${height}px`,
            position: 'relative',
            background: 'rgba(26, 26, 46, 0.8)',
            borderRadius: '15px',
            overflow: 'hidden'
        }}>
            {isLoading && (
                <div className="loading-spinner" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    textAlign: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #00bcd4',
                        borderTop: '3px solid transparent',
                        borderRadius: '50%',
                        margin: '0 auto 10px',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p>Loading 3D Experience...</p>
                </div>
            )}
            <div 
                ref={mountRef} 
                className="three-canvas-container" 
                style={{ 
                    display: isLoading ? 'none' : 'block',
                    width: '100%', 
                    height: '100%',
                    cursor: 'pointer'
                }} 
            />
        </div>
    );
};

/**
 * App Component
 * A simple wrapper component to host the Interactive3DWidget.
 * Manages responsive width for the widget.
 */
const App = () => {
    const widgetWidth = Math.min(600, window.innerWidth - 40);
    const widgetHeight = 400;
    const [rotationSpeed, setRotationSpeed] = useState(0.01);

    return (
        <div className="App" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#fff',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
        }}>
            <header style={{
                textAlign: 'center',
                marginBottom: '10px'
            }}>
                <h1 style={{
                    fontSize: '2.8em',
                    margin: '0',
                    background: 'linear-gradient(45deg, #00bcd4, #4a90e2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                }}>
                    Interactive 3D Cube
                </h1>
            </header>
            
            <Interactive3DWidget 
                width={widgetWidth} 
                height={widgetHeight} 
                rotationSpeed={rotationSpeed} 
            />
            
            <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px 20px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '10px'
            }}>
                <label htmlFor="speedControl" style={{ color: '#fff', fontSize: '0.9em' }}>Rotation Speed:</label>
                <input
                    type="range"
                    id="speedControl"
                    min="0.001"
                    max="0.3"
                    step="0.001"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    style={{
                        width: '150px',
                        cursor: 'pointer'
                    }}
                />
                <span style={{ 
                    color: '#00bcd4', 
                    minWidth: '45px',
                    fontSize: '0.9em'
                }}>
                    {rotationSpeed.toFixed(3)}
                </span>
            </div>
        </div>
    );
}

// Add keyframe animation for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Render the main App component into the DOM element with id 'root'.
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

