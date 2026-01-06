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
                range: ['#22c55e', '#ef4444'],
            },
        },
        label: {
            text: 'value',
            position: 'outside',
            style: {
                fill: '#a3a3a3',
                fontSize: 12,
            },
        },
        legend: {
            color: {
                position: 'bottom',
                itemLabelFill: '#a3a3a3',
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
                    fill: '#ffffff',
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
                    fill: '#a3a3a3',
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
            <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-white">Staff Attendance</CardTitle>
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
