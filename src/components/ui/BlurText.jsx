import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export const BlurText = ({
    text,
    delay = 0,
    wordDelay = 0.35,
    className = "",
    animateBy = "words", // as per user request (words)
}) => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // Split text into lines/words based on <br /> or newlines
    // But for a simple editorial headline, we can just split by spaces
    // and handle the <br /> if we pass them as part of the text string or separate elements.
    // However, the user request specifically says "COLLABORATE IN VIBRANT COWORKING" 
    // and shown as 3 lines.

    // Flatten all text into words while keeping track of where we need line breaks if provided as an array
    const lines = Array.isArray(text) ? text : [text];

    // Create a flat array of words with a special marker for line breaks
    const allElements = [];
    lines.forEach((line, lineIndex) => {
        const words = line.split(' ');
        words.forEach((word, wordIndex) => {
            allElements.push({ text: word, isBreak: false });
        });
        if (lineIndex < lines.length - 1) {
            allElements.push({ text: '', isBreak: true });
        }
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: wordDelay,
                delayChildren: delay
            }
        }
    };

    const itemVariants = {
        hidden: {
            filter: 'blur(10px)',
            opacity: 0,
            y: -40
        },
        visible: {
            filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
            opacity: [0, 0.5, 1],
            y: [-40, 5, 0],
            transition: {
                duration: 0.8,
                times: [0, 0.5, 1],
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            ref={containerRef}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            className={`inline-block ${className}`}
        >
            {allElements.map((element, index) => (
                <span key={index} className="inline-block">
                    {element.isBreak ? (
                        <br />
                    ) : (
                        <span className="inline-block overflow-visible mr-[0.25em]">
                            <motion.span
                                variants={itemVariants}
                                className="inline-block"
                                style={{ willChange: "filter, opacity, transform" }}
                            >
                                {element.text === "" ? "\u00A0" : element.text}
                            </motion.span>
                        </span>
                    )}
                </span>
            ))}
        </motion.div>
    );
};
