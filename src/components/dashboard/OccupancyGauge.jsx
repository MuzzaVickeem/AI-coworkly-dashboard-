import { useEffect, useState } from 'react';
import { Pie } from '@ant-design/charts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconGauge } from '@tabler/icons-react';

export function OccupancyGauge({ percentage }) {
    const [key, setKey] = useState(0);

    useEffect(() => {
        setKey(prev => prev + 1);
    }, [percentage]);

    // Determine color based on percentage
    const getColor = (p) => {
        if (p < 50) return '#10B981'; // Green
        if (p < 80) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    const color = getColor(percentage);

    const data = [
        { type: 'Occupied', value: percentage },
        { type: 'Remaining', value: 100 - percentage },
    ];

    const config = {
        data,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.65,
        startAngle: Math.PI,
        endAngle: Math.PI * 3,
        autoFit: true, // Critical for rendering in flex containers
        
        color: ({ type }) => {
            if (type === 'Occupied') return color;
            return '#f1f5f9';
        },

        label: false,
        legend: false,
        tooltip: false,
        statistic: null,
        
        animate: {
            enter: { type: 'waveIn', duration: 800, easing: 'easeOutQuart' },
        },
        
        // Remove interactions that might confuse the render
        interaction: false,
    };

    const getStatusText = (p) => {
        if (p < 50) return 'Available';
        if (p < 80) return 'Moderate';
        return 'Full';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
        >
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <IconGauge className="w-5 h-5 text-slate-400" />
                        Occupancy Rate
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[calc(100%-60px)] flex flex-col items-center justify-center">
                     {/* Increased wrapper size and removed complex absolute positioning that might clip canvas */}
                    <div className="h-64 w-full relative flex items-center justify-center">
                        <Pie key={key} {...config} />
                        
                        {/* Center Text - Positioned Absolutely over the chart */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                             <motion.span 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-5xl font-bold tracking-tight"
                                style={{ color: color }}
                             >
                                 {percentage}%
                             </motion.span>
                             <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                                {getStatusText(percentage)}
                             </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
