import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

const ImageComparisonSlider = ({
    beforeImage,
    afterImage,
    beforeLabel = "Original",
    afterLabel = "Muestra"
}) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    const handleMouseDown = useCallback(() => setIsResizing(true), []);
    const handleMouseUp = useCallback(() => setIsResizing(false), []);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing || !containerRef.current) return;

        // Calculate new position based on clientX relative to container
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // Clamp between 0 and 100
        const newPos = Math.min(Math.max((x / width) * 100, 0), 100);
        setSliderPosition(newPos);
    }, [isResizing]);

    // Touch support
    const handleTouchMove = useCallback((e) => {
        if (!isResizing || !containerRef.current) return;
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const width = rect.width;
        const newPos = Math.min(Math.max((x / width) * 100, 0), 100);
        setSliderPosition(newPos);
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp, handleTouchMove]);

    if (!beforeImage || !afterImage) return null;

    return (
        <div className="w-full bg-stone-100 dark:bg-neutral-900 rounded-xl overflow-hidden shadow-sm border border-stone-200 dark:border-neutral-800 p-1">
            <div className="flex justify-between px-4 py-2 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <span>{beforeLabel}</span>
                <span className="flex items-center gap-1">
                    <MoveHorizontal size={14} /> Desliza para comparar
                </span>
                <span>{afterLabel}</span>
            </div>

            <div
                ref={containerRef}
                className="relative w-full aspect-video select-none touch-none bg-checkerboard"
                onMouseDown={(e) => {
                    // Click jump support
                    const rect = containerRef.current.getBoundingClientRect();
                    setSliderPosition(((e.clientX - rect.left) / rect.width) * 100);
                    setIsResizing(true);
                }}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const rect = containerRef.current.getBoundingClientRect();
                    setSliderPosition(((touch.clientX - rect.left) / rect.width) * 100);
                    setIsResizing(true);
                }}
            >
                {/* After Image (Background - Sample) */}
                <img
                    src={afterImage}
                    alt={afterLabel}
                    className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Before Image (Foreground - Clipped - Original) */}
                <div
                    className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-orange-500 box-content bg-stone-50/5"
                    style={{ width: `${sliderPosition}%` }}
                >
                    <img
                        src={beforeImage}
                        alt={beforeLabel}
                        className="absolute top-0 left-0 max-w-none h-full object-contain pointer-events-none"
                        style={{
                            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw'
                            // Note: This relies on aspect-ratio container. object-contain centers it.
                            // For slider to work perfectly with object-contain, images must have SAME aspect ratio or be centered identically.
                            // A simplified approach for disparate layouts might be object-cover, but validation needs full image.
                            // We will use object-contain and assume CSS centering aligns them if they are comparable.
                            // To ensure perfect alignment for overlay, we force them to fill specific dimensions if possible, 
                            // but object-contain is safer for variable user uploads.
                        }}
                    />
                </div>

                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-20"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-white">
                        <MoveHorizontal size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageComparisonSlider;
