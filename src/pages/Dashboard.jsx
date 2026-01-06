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
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                key={`header-${animationKey}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-neutral-400">{selectedLocation?.name}</p>
            </motion.div>

            {/* KPI Cards */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`kpis-${animationKey}`}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <KPICard
                        title="Total Seats"
                        value={kpis.totalSeats}
                        icon={IconArmchair2}
                        color="blue"
                        delay={0}
                    />
                    <KPICard
                        title="Occupied Seats"
                        value={kpis.occupiedSeats}
                        icon={IconArmchair}
                        color="green"
                        delay={0.1}
                    />
                    <KPICard
                        title="Vacant Seats"
                        value={kpis.vacantSeats}
                        icon={IconArmchair}
                        color="amber"
                        delay={0.2}
                    />
                    <KPICard
                        title="Occupancy"
                        value={kpis.occupancyPercentage}
                        suffix="%"
                        icon={IconPercentage}
                        color="purple"
                        delay={0.3}
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
        </div>
    );
}
