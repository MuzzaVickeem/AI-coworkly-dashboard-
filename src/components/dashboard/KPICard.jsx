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
    const animatedValue = useCountUp(value, 600);

    const colorClasses = {
        blue: 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-blue-100/50',
        green: 'bg-white border-slate-200 hover:border-emerald-200 hover:shadow-emerald-100/50',
        purple: 'bg-white border-slate-200 hover:border-violet-200 hover:shadow-violet-100/50',
        amber: 'bg-white border-slate-200 hover:border-amber-200 hover:shadow-amber-100/50',
        red: 'bg-white border-slate-200 hover:border-red-200 hover:shadow-red-100/50',
    };

    const iconColorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-emerald-600 bg-emerald-50',
        purple: 'text-violet-600 bg-violet-50',
        amber: 'text-amber-600 bg-amber-50',
        red: 'text-red-600 bg-red-50',
    };

    const accentColors = {
        blue: 'text-blue-600',
        green: 'text-emerald-600',
        purple: 'text-violet-600',
        amber: 'text-amber-600',
        red: 'text-red-600',
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
                transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
            }}
        >
            <Card
                className={cn(
                    'border rounded-xl transition-all duration-300',
                    'hover:shadow-lg',
                    colorClasses[color]
                )}
            >
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
                            <p className={cn('text-3xl font-bold tracking-tight', accentColors[color])}>
                                {prefix}
                                {animatedValue.toLocaleString()}
                                {suffix}
                            </p>
                            {trend !== undefined && (
                                <div className="flex items-center gap-1 mt-2">
                                    <span
                                        className={cn(
                                            'text-xs font-medium',
                                            trend >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        )}
                                    >
                                        {trend >= 0 ? '+' : ''}
                                        {trend}%
                                    </span>
                                    {trendLabel && (
                                        <span className="text-xs text-slate-400">{trendLabel}</span>
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
