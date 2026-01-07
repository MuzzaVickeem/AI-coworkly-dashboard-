import { useEffect, useState } from 'react';
import { Pie } from '@ant-design/charts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AttendanceDonut({ present, absent }) {
    const [key, setKey] = useState(0);

    useEffect(() => {
        setKey(prev => prev + 1);
    }, [present, absent]);

    const data = [
        { type: 'Present', value: present },
        { type: 'Absent', value: absent },
    ];

    const config = {
        data,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.64,
        scale: {
            color: {
                range: ['#10B981', '#f1f5f9'], // Emerald and very light slate
            },
        },
        label: {
            text: 'value',
            position: 'spider',
            style: {
                fill: '#64748B',
                fontSize: 12,
                fontWeight: 'bold',
            },
            connector: {
                stroke: '#cbd5e1',
                lineWidth: 1,
            },
        },
        legend: {
            color: {
                position: 'bottom',
                itemLabelFill: '#64748B',
                itemLabelFontSize: 12,
                marker: { symbol: 'circle' },
            },
        },
        annotations: [
            {
                type: 'text',
                style: {
                    text: `${((present / (present + absent || 1)) * 100).toFixed(0)}%`,
                    x: '50%',
                    y: '45%',
                    textAlign: 'center',
                    fontSize: 32,
                    fontWeight: 'bold',
                    fill: '#10B981',
                },
            },
            {
                type: 'text',
                style: {
                    text: 'Attendance',
                    x: '50%',
                    y: '55%',
                    textAlign: 'center',
                    fontSize: 12,
                    fill: '#64748B',
                    fontWeight: '500',
                },
            },
        ],
        animate: {
            enter: { type: 'waveIn', duration: 800 },
        },
        interaction: {
            elementHighlight: true,
            tooltip: {
                render: (e, { title, items }) => {
                    return (
                        <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100">
                             <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full" style={{ background: items[0].color }}></div>
                                <span className="text-slate-500 text-sm">{items[0].name}:</span>
                                <span className="font-bold text-slate-900 text-sm">{items[0].value}</span>
                             </div>
                        </div>
                    );
                }
            }
        },
        statistic: null, // Disable default statistic to use custom annotations
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
        >
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-900">Staff Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Pie key={key} {...config} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
