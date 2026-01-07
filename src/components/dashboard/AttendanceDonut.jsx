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
        innerRadius: 0.6,
        scale: {
            color: {
                range: ['#10B981', '#F87171'],
            },
        },
        label: {
            text: 'value',
            position: 'outside',
            style: {
                fill: '#64748B',
                fontSize: 12,
            },
        },
        legend: {
            color: {
                position: 'bottom',
                itemLabelFill: '#64748B',
                itemLabelFontSize: 12,
            },
        },
        annotations: [
            {
                type: 'text',
                style: {
                    text: `${present + absent}`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    fill: '#0F172A',
                },
            },
            {
                type: 'text',
                style: {
                    text: 'Total Staff',
                    x: '50%',
                    y: '58%',
                    textAlign: 'center',
                    fontSize: 12,
                    fill: '#64748B',
                },
            },
        ],
        animate: {
            enter: { type: 'waveIn', duration: 600 },
        },
        interaction: {
            elementHighlight: true,
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.56, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <Card className="bg-white border-slate-200 shadow-sm">
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
