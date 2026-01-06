import { useEffect, useState } from 'react';
import { Bar } from '@ant-design/charts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { locations } from '@/data/locations';

export function TenantDistribution() {
    const { getTenantsByLocation, getActiveTenantsByLocation } = useData();
    const [data, setData] = useState([]);
    const [key, setKey] = useState(0);

    useEffect(() => {
        const chartData = locations.map((loc) => {
            const tenants = getTenantsByLocation(loc.id);
            const activeTenants = getActiveTenantsByLocation(loc.id);
            return {
                location: loc.name.split(' - ')[1] || loc.name,
                active: activeTenants.length,
                inactive: tenants.length - activeTenants.length,
            };
        });

        // Transform for stacked bar
        const transformedData = chartData.flatMap((item) => [
            { location: item.location, status: 'Active', count: item.active },
            { location: item.location, status: 'Inactive', count: item.inactive },
        ]);

        setData(transformedData);
        setKey(prev => prev + 1);
    }, [getTenantsByLocation, getActiveTenantsByLocation]);

    const config = {
        data,
        xField: 'count',
        yField: 'location',
        colorField: 'status',
        stack: true,
        scale: {
            color: {
                range: ['#8b5cf6', '#6b7280'],
            },
        },
        axis: {
            x: {
                title: false,
                labelFontSize: 12,
                labelFill: '#a3a3a3',
                grid: { line: { style: { stroke: '#303030' } } },
            },
            y: {
                title: false,
                labelFontSize: 12,
                labelFill: '#a3a3a3',
                line: { style: { stroke: '#404040' } },
            },
        },
        legend: {
            color: {
                position: 'top-right',
                itemLabelFill: '#a3a3a3',
                itemLabelFontSize: 12,
            },
        },
        style: {
            radiusTopRight: 4,
            radiusBottomRight: 4,
        },
        animate: {
            enter: { type: 'growInX', duration: 600 },
        },
        interaction: {
            elementHighlight: true,
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.64, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-white">Tenant Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Bar key={key} {...config} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
