import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconArmchair2,
    IconArmchair,
    IconPercentage,
    IconUsers,
} from '@tabler/icons-react';
import { useLocation } from '@/context/LocationContext';
import { useData } from '@/context/DataContext';
import { KPICard } from '@/components/dashboard/KPICard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { OccupancyGauge } from '@/components/dashboard/OccupancyGauge';
import { AttendanceDonut } from '@/components/dashboard/AttendanceDonut';
import { TenantDistribution } from '@/components/dashboard/TenantDistribution';

export function Dashboard() {
    const { selectedLocationId, selectedLocation } = useLocation();
    const { calculateLocationKPIs, getAttendanceStats } = useData();
    const [kpis, setKpis] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0 });
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        const locationKPIs = calculateLocationKPIs(selectedLocationId);
        setKpis(locationKPIs);

        const today = new Date().toISOString().split('T')[0];
        const stats = getAttendanceStats(selectedLocationId, today);
        setAttendanceStats(stats);

        // Trigger animation on location change
        setAnimationKey((prev) => prev + 1);
    }, [selectedLocationId, calculateLocationKPIs, getAttendanceStats]);

    if (!kpis) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-8"
        >
            {/* Page Header */}
            <motion.div
                key={`header-${animationKey}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Operations Overview</h1>
                        <p className="text-slate-500">{selectedLocation?.name}</p>
                    </div>
                    <div className="text-sm text-slate-400 bg-white px-4 py-2 rounded-lg border border-slate-200">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`kpis-${animationKey}`}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                >
                    <KPICard
                        title="Total Tenants"
                        value={kpis.tenantCount}
                        icon={IconUsers}
                        color="blue"
                        delay={0}
                    />
                    <KPICard
                        title="Seat Occupancy"
                        value={kpis.occupancyPercentage}
                        suffix="%"
                        icon={IconPercentage}
                        color="purple"
                        delay={0.08}
                    />
                    <KPICard
                        title="Vacant Seats"
                        value={kpis.vacantSeats}
                        icon={IconArmchair}
                        color="amber"
                        delay={0.16}
                    />
                    <KPICard
                        title="Staff Present Today"
                        value={attendanceStats.present}
                        icon={IconUsers}
                        color="green"
                        delay={0.24}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OccupancyChart locationId={selectedLocationId} />
                <OccupancyGauge percentage={kpis.occupancyPercentage} />
                <AttendanceDonut
                    present={attendanceStats.present}
                    absent={attendanceStats.absent}
                />
                <TenantDistribution />
            </div>
        </motion.div>
    );
}
