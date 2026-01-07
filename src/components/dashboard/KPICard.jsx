import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Hook for counting animation
function useCountUp(end, duration = 1000, start = 0) {
    const [count, setCount] = useState(start);
    const countRef = useRef(start);
    const frameRef = useRef();

    useEffect(() => {
        const startTime = performance.now();
        const startValue = countRef.current;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutQuart)
            const eased = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (end - startValue) * eased);

            setCount(currentValue);
            countRef.current = currentValue;

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [end, duration]);

    return count;
}

export function KPICard({
    title,
    value,
    icon: Icon,
    suffix = '',
    prefix = '',
    trend,
    trendLabel,
    color = 'blue',
    delay = 0,
}) {
    const animatedValue = useCountUp(value, 800); // Slightly longer for smoother feel

    const colorVariants = {
        blue: {
            card: 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)]',
            icon: 'text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white',
            text: 'text-blue-600',
            trend: 'text-blue-600'
        },
        green: {
            card: 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)]',
            icon: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
            text: 'text-emerald-600',
            trend: 'text-emerald-600'
        },
        purple: {
            card: 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-[0_8px_30px_rgb(139,92,246,0.15)]',
            icon: 'text-violet-600 bg-violet-50 group-hover:bg-violet-600 group-hover:text-white',
            text: 'text-violet-600',
            trend: 'text-violet-600'
        },
        amber: {
            card: 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-[0_8px_30px_rgb(245,158,11,0.15)]',
            icon: 'text-amber-600 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white',
            text: 'text-amber-600',
            trend: 'text-amber-600'
        },
        red: {
            card: 'bg-white border-slate-200 hover:border-red-300 hover:shadow-[0_8px_30px_rgb(239,68,68,0.15)]',
            icon: 'text-red-600 bg-red-50 group-hover:bg-red-600 group-hover:text-white',
            text: 'text-red-600',
            trend: 'text-red-600'
        },
    };

    const variant = colorVariants[color] || colorVariants.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                delay: delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
                y: -5,
                scale: 1.02,
                transition: { duration: 0.3, ease: 'easeOut' },
            }}
            className="group"
        >
            <Card
                className={cn(
                    'border rounded-2xl transition-all duration-300',
                    'overflow-hidden relative',
                    variant.card
                )}
            >
                {/* Decorative blob */}
                <div className={cn(
                    "absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl",
                    color === 'blue' && "bg-blue-500",
                    color === 'green' && "bg-emerald-500",
                    color === 'purple' && "bg-violet-500",
                    color === 'amber' && "bg-amber-500",
                    color === 'red' && "bg-red-500",
                )} />

                <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-semibold text-slate-400">{prefix}</span>
                                <motion.span 
                                    key={value}
                                    initial={{ opacity: 0.5, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn('text-4xl font-bold tracking-tight', variant.text)}
                                >
                                    {animatedValue.toLocaleString()}
                                </motion.span>
                                <span className="text-lg font-semibold text-slate-400">{suffix}</span>
                            </div>
                            
                            {(trend !== undefined || trendLabel) && (
                                <div className="flex items-center gap-1 mt-3">
                                    {trend !== undefined && (
                                        <span
                                            className={cn(
                                                'text-xs font-bold px-1.5 py-0.5 rounded',
                                                trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            )}
                                        >
                                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                        </span>
                                    )}
                                    {trendLabel && (
                                        <span className="text-xs text-slate-400">{trendLabel}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {Icon && (
                            <div
                                className={cn(
                                    'p-3.5 rounded-xl transition-colors duration-300',
                                    variant.icon
                                )}
                            >
                                <Icon size={26} stroke={1.5} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
