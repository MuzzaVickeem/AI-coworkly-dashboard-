import { useEffect, useState } from 'react';
import { Column } from '@ant-design/charts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { locations } from '@/data/locations';

export function OccupancyChart({ locationId }) {
    const { calculateLocationKPIs } = useData();
    const [data, setData] = useState([]);
    const [key, setKey] = useState(0);

    useEffect(() => {
        // If showing all locations
        if (!locationId || locationId === 'all') {
            const chartData = locations.map((loc) => {
                const kpis = calculateLocationKPIs(loc.id);
                return [
                    { location: loc.name.split(' - ')[1] || loc.name, type: 'Occupied', seats: kpis?.occupiedSeats || 0 },
                    { location: loc.name.split(' - ')[1] || loc.name, type: 'Vacant', seats: kpis?.vacantSeats || 0 },
                ];
            }).flat();
            setData(chartData);
        } else {
            // Single location view
            const kpis = calculateLocationKPIs(locationId);
            const loc = locations.find(l => l.id === locationId);
            const chartData = [
                { location: 'Occupied', type: 'Occupied', seats: kpis?.occupiedSeats || 0 },
                { location: 'Vacant', type: 'Vacant', seats: kpis?.vacantSeats || 0 },
            ];
            setData(chartData);
        }
        // Trigger re-render for animation
        setKey(prev => prev + 1);
    }, [locationId, calculateLocationKPIs]);

    const config = {
        data,
        xField: 'location',
        yField: 'seats',
        colorField: 'type',
        group: true,
        style: {
            radiusTopLeft: 4,
            radiusTopRight: 4,
        },
        scale: {
            color: {
                range: ['#3b82f6', '#6b7280'],
            },
        },
        axis: {
            x: {
                title: false,
                labelFontSize: 12,
                labelFill: '#a3a3a3',
                line: { style: { stroke: '#404040' } },
            },
            y: {
                title: false,
                labelFontSize: 12,
                labelFill: '#a3a3a3',
                grid: { line: { style: { stroke: '#303030' } } },
            },
        },
        legend: {
            color: {
                position: 'top-right',
                itemLabelFill: '#a3a3a3',
                itemLabelFontSize: 12,
            },
        },
        animate: {
            enter: { type: 'growInY', duration: 600 },
        },
        interaction: {
            elementHighlight: true,
        },
        state: {
            active: { style: { fill: '#60a5fa' } },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-white">Seat Occupancy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Column key={key} {...config} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
