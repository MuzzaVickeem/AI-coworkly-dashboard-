import { useEffect, useRef, useCallback } from 'react';

/**
 * SplashCursor - Subtle cursor trail effect
 * Only active on Dashboard and Seats overview pages
 * Automatically disabled on mobile and low-performance devices
 */
export function SplashCursor({ color = '#3b82f6', opacity = 0.15, size = 20 }) {
    const canvasRef = useRef(null);
    const pointsRef = useRef([]);
    const animationRef = useRef(null);
    const isEnabledRef = useRef(true);

    // Check if device supports smooth cursor effects
    const checkPerformance = useCallback(() => {
        // Disable on mobile/touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            return false;
        }
        // Disable if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }
        // Disable on smaller screens (likely mobile)
        if (window.innerWidth < 768) {
            return false;
        }
        return true;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Check if effect should be enabled
        isEnabledRef.current = checkPerformance();
        if (!isEnabledRef.current) return;

        // Set canvas size
        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        // Parse color to RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 59, g: 130, b: 246 }; // Default blue
        };
        const rgb = hexToRgb(color);

        // Track mouse movement
        const handleMouseMove = (e) => {
            if (!isEnabledRef.current) return;

            pointsRef.current.push({
                x: e.clientX,
                y: e.clientY,
                age: 0,
                maxAge: 60, // Frames until fade out
            });

            // Limit trail length for performance
            if (pointsRef.current.length > 25) {
                pointsRef.current.shift();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            pointsRef.current = pointsRef.current.filter(point => {
                point.age++;

                // Calculate fade based on age
                const lifeRatio = 1 - (point.age / point.maxAge);
                if (lifeRatio <= 0) return false;

                // Draw splash circle
                const currentSize = size * lifeRatio;
                const currentOpacity = opacity * lifeRatio * lifeRatio; // Quadratic fade

                ctx.beginPath();
                ctx.arc(point.x, point.y, currentSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentOpacity})`;
                ctx.fill();

                return true;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', updateCanvasSize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [color, opacity, size, checkPerformance]);

    // Don't render on unsupported devices
    if (typeof window !== 'undefined' && !checkPerformance()) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                pointerEvents: 'none',
                opacity: 1,
            }}
            aria-hidden="true"
        />
    );
}

export default SplashCursor;
