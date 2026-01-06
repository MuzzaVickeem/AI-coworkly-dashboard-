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
    const animatedValue = useCountUp(value, 1200);

    const colorClasses = {
        blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
        green: 'from-green-500/20 to-green-600/5 border-green-500/30',
        purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
        amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
        red: 'from-red-500/20 to-red-600/5 border-red-500/30',
    };

    const iconColorClasses = {
        blue: 'text-blue-400 bg-blue-500/20',
        green: 'text-green-400 bg-green-500/20',
        purple: 'text-purple-400 bg-purple-500/20',
        amber: 'text-amber-400 bg-amber-500/20',
        red: 'text-red-400 bg-red-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
                y: -4,
                transition: { duration: 0.2 },
            }}
        >
            <Card
                className={cn(
                    'bg-gradient-to-br border backdrop-blur-sm transition-shadow duration-300',
                    'hover:shadow-lg hover:shadow-black/20',
                    colorClasses[color]
                )}
            >
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-400 mb-2">{title}</p>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                {prefix}
                                {animatedValue.toLocaleString()}
                                {suffix}
                            </p>
                            {trend !== undefined && (
                                <div className="flex items-center gap-1 mt-2">
                                    <span
                                        className={cn(
                                            'text-xs font-medium',
                                            trend >= 0 ? 'text-green-400' : 'text-red-400'
                                        )}
                                    >
                                        {trend >= 0 ? '+' : ''}
                                        {trend}%
                                    </span>
                                    {trendLabel && (
                                        <span className="text-xs text-neutral-500">{trendLabel}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {Icon && (
                            <div
                                className={cn(
                                    'p-3 rounded-xl',
                                    iconColorClasses[color]
                                )}
                            >
                                <Icon size={24} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
