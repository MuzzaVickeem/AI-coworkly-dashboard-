import { useEffect, useState } from 'react';
import { Gauge } from '@ant-design/charts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OccupancyGauge({ percentage }) {
    const [key, setKey] = useState(0);

    useEffect(() => {
        setKey(prev => prev + 1);
    }, [percentage]);

    const config = {
        data: {
            target: percentage / 100,
            total: 1,
            name: 'Occupancy',
        },
        scale: {
            color: {
                range: ['#3b82f6', '#22c55e', '#eab308', '#ef4444'],
            },
        },
        style: {
            textContent: () => `${percentage}%`,
        },
        legend: false,
        animate: {
            enter: { type: 'waveIn', duration: 600 },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-white">Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <Gauge key={key} {...config} />
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-3xl font-bold text-white">{percentage}%</span>
                        <p className="text-sm text-neutral-400 mt-1">Current Occupancy</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
