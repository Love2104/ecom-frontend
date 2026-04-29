import { useEffect, useState, useRef } from 'react';

export const MagneticCursor = () => {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    
    // Position of the mouse
    const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
    // Position of the ring (lagging behind)
    const ringPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const checkTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsTouchDevice(checkTouch);
        
        if (checkTouch) return;

        // Hide default cursor
        document.body.style.cursor = 'none';

        const onMouseMove = (e: MouseEvent) => {
            mousePos.current.x = e.clientX;
            mousePos.current.y = e.clientY;
            
            // Move dot instantly
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
            }
        };

        const updateCursor = () => {
            // Ultra fast responsive lag (0.6)
            ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.6;
            ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.6;
            
            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
            }
            
            requestAnimationFrame(updateCursor);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === 'button' ||
                target.tagName.toLowerCase() === 'a' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer') ||
                window.getComputedStyle(target).cursor === 'pointer'
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        
        // Initial setup for the dot transform
        if (dotRef.current) {
            dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
        }
        
        let animationFrameId = requestAnimationFrame(updateCursor);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            cancelAnimationFrame(animationFrameId);
            document.body.style.cursor = 'auto';
        };
    }, []);

    if (isTouchDevice) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* The Dot */}
            <div 
                ref={dotRef}
                className={`fixed top-0 left-0 rounded-full bg-accent-red shadow-[0_0_10px_rgba(230,57,70,0.5)] transition-[width,height,opacity] duration-200 will-change-transform mix-blend-difference ${isHovering ? 'w-6 h-6' : 'w-3 h-3'}`}
                style={{ position: 'fixed', pointerEvents: 'none' }}
            />
            {/* The Ring */}
            <div 
                ref={ringRef}
                className={`fixed top-0 left-0 rounded-full border border-primary/50 transition-opacity duration-300 will-change-transform w-10 h-10 ${isHovering ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
                style={{ position: 'fixed', pointerEvents: 'none' }}
            />
        </div>
    );
};
