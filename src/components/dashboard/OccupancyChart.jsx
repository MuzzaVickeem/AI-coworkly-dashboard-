import { useEffect, useState } from 'react';
import { Column } from '@ant-design/charts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { locations } from '@/data/locations';
import { IconArmchair } from '@tabler/icons-react';

export function OccupancyChart({ locationId }) {
    const { calculateLocationKPIs } = useData();
    const [data, setData] = useState([]);
    const [key, setKey] = useState(0);

    useEffect(() => {
        let chartData = [];
        
        if (!locationId || locationId === 'all') {
            // All locations view - show comparison
            chartData = locations.flatMap((loc) => {
                const kpis = calculateLocationKPIs(loc.id);
                const locName = loc.name.split(' - ')[1] || loc.name;
                return [
                    { location: locName, status: 'Occupied', seats: kpis?.occupiedSeats || 0 },
                    { location: locName, status: 'Vacant', seats: kpis?.vacantSeats || 0 },
                ];
            });
        } else {
            // Single location view - show stacked capacity
            const kpis = calculateLocationKPIs(locationId);
            const loc = locations.find(l => l.id === locationId);
            const locName = loc ? (loc.name.split(' - ')[1] || loc.name) : 'Current Location';
            
            chartData = [
                { location: locName, status: 'Occupied', seats: kpis?.occupiedSeats || 0 },
                { location: locName, status: 'Vacant', seats: kpis?.vacantSeats || 0 },
            ];
        }
        
        setData(chartData);
        // Trigger re-render to animate
        setKey(prev => prev + 1);
    }, [locationId, calculateLocationKPIs]);

    const config = {
        data,
        xField: 'location',
        yField: 'seats',
        colorField: 'status',
        seriesField: 'status',
        isStack: true,
        stack: true,
        scrollbar: false, // explicit disable
        slider: false,    // explicit disable
        
        // Colors
        color: ({ status }) => {
            return status === 'Occupied' ? '#3b82f6' : '#f1f5f9';
        },

        // Axis
        xAxis: {
            label: null, // Hide x-axis labels to avoid "Current Location" repeated or visual clutter
            line: null,
            grid: null,
        },
        yAxis: {
            label: null,
            grid: {
                line: {
                    style: {
                        stroke: '#f1f5f9',
                        lineDash: [4, 4],
                    },
                },
            },
        },
        
        legend: {
            position: 'top-right',
            marker: { symbol: 'circle' },
        },
        
        // Tooltip
        tooltip: {
            customContent: (title, items) => {
                const total = items.reduce((acc, curr) => acc + (parseFloat(curr.value || curr.data?.seats) || 0), 0);
                return (
                    <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100 min-w-[150px]">
                        <div className="text-sm font-semibold text-slate-700 mb-2">Capacity Details</div>
                        {items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm mb-1 last:mb-0">
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-slate-500">{item.name}</span>
                                </div>
                                <span className="font-medium text-slate-900">{item.value}</span>
                            </div>
                        ))}
                         <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-slate-400">Total Seats</span>
                            <span className="text-xs font-bold text-slate-700">{total}</span>
                        </div>
                    </div>
                );
            }
        },
        
        // Styling
        columnStyle: {
            radius: [4, 4, 0, 0],
        },
        
        animate: {
            enter: { type: 'scaleInY', duration: 800 },
        },
        
        theme: 'classic',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
        >
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <IconArmchair className="w-5 h-5 text-slate-400" />
                        Seat Occupancy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-72 w-full">
                         {/* Force full width to prevent pagination issues if container is small */}
                        <Column key={key} {...config} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
