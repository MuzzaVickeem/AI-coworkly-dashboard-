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
                range: ['#2563EB', '#10B981', '#F59E0B', '#EF4444'],
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
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-900">Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <Gauge key={key} {...config} />
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-3xl font-bold text-blue-600">{percentage}%</span>
                        <p className="text-sm text-slate-500 mt-1">Current Occupancy</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
