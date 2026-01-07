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
        group: false,
        stack: true, // Stacked bar
        scale: {
            color: {
                range: ['#8B5CF6', '#e2e8f0'], // Violet and light slate
            },
        },
        axis: {
            x: {
                title: false,
                labelFontSize: 11,
                labelFill: '#94a3b8',
                grid: { 
                    line: { 
                        style: { 
                            stroke: '#f1f5f9',
                            lineDash: [4, 4] 
                        } 
                    } 
                },
            },
            y: {
                title: false,
                labelFontSize: 12,
                labelFill: '#475569',
                labelAutoRotate: false,
                line: null,
            },
        },
        legend: {
            color: {
                position: 'top-right',
                itemLabelFill: '#64748B',
                itemLabelFontSize: 12,
                marker: { symbol: 'circle' },
            },
        },
        style: {
            radiusTopRight: 4,
            radiusBottomRight: 4,
        },
        animate: {
            enter: { type: 'scaleInX', duration: 800 },
        },
        interaction: {
            elementHighlight: { background: true },
            tooltip: {
                render: (e, { title, items }) => {
                    return (
                        <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100">
                            <div className="text-sm font-semibold text-slate-700 mb-2">{title}</div>
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
                                    <span 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-slate-500">{item.name}:</span>
                                    <span className="font-medium text-slate-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    );
                }
            }
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
        >
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-900">Tenant Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-72">
                        <Bar key={key} {...config} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
