import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_IMAGES = [
    '/intro/workspace-1.png',
    '/intro/collaboration-2.png',
    '/intro/meeting-room-3.png',
    '/intro/lounge-4.png',
    '/intro/focus-pods-5.png',
    '/intro/reception-6.png',
];

const IMAGE_DURATION = 800; // ms per image

export function IntroSequence({ onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (isExiting) return;

        const timer = setTimeout(() => {
            if (currentIndex < INTRO_IMAGES.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                // Last image shown, start exit sequence
                setIsExiting(true);
                setTimeout(() => {
                    onComplete?.();
                }, 600); // Match container exit duration
            }
        }, IMAGE_DURATION);

        return () => clearTimeout(timer);
    }, [currentIndex, isExiting, onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />

            {/* Image carousel */}
            <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={INTRO_IMAGES[currentIndex]}
                        alt={`Co-working space ${currentIndex + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.0 }}
                        animate={{ opacity: 1, scale: 1.03 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                    />
                </AnimatePresence>
            </div>

            {/* Subtle vignette effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 pointer-events-none" />
        </motion.div>
    );
}
