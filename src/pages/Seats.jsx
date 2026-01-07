import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconBuilding, IconBuildingSkyscraper, IconDoor, IconChartPie } from '@tabler/icons-react';
import { useLocation } from '@/context/LocationContext';
import { useBooking } from '@/context/BookingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RoomBookingSection } from '@/components/RoomBookingSection';
import { SplashCursor } from '@/components/SplashCursor';

// Animated number counter hook
function useAnimatedValue(targetValue, duration = 500) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime = null;
        const startValue = displayValue;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeProgress);

            setDisplayValue(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [targetValue]);

    return displayValue;
}

// Utilization status helper
function getUtilizationStatus(percentage) {
    if (percentage < 40) return { label: 'Underutilized', color: 'text-amber-600', bgColor: 'bg-amber-500' };
    if (percentage <= 75) return { label: 'Healthy', color: 'text-emerald-600', bgColor: 'bg-emerald-500' };
    return { label: 'High Demand', color: 'text-orange-600', bgColor: 'bg-orange-500' };
}

export function Seats() {
    const { selectedLocation, selectedLocationId } = useLocation();
    const { getRoomStats, refreshBookingStates } = useBooking();

    // Refresh booking states when location changes or on mount
    useEffect(() => {
        refreshBookingStates();
    }, [selectedLocationId, refreshBookingStates]);


    const { totalRooms, occupiedRooms, availableRooms } = getRoomStats(selectedLocationId);

    // Calculate utilization
    const utilization = useMemo(() => {
        if (totalRooms === 0) return 0;
        return Math.round((occupiedRooms / totalRooms) * 100);
    }, [occupiedRooms, totalRooms]);

    const utilizationStatus = getUtilizationStatus(utilization);

    // Animated values
    const animatedTotal = useAnimatedValue(totalRooms);
    const animatedOccupied = useAnimatedValue(occupiedRooms);
    const animatedAvailable = useAnimatedValue(availableRooms);
    const animatedUtilization = useAnimatedValue(utilization);

    return (
        <>
            {/* Subtle cursor effect - disabled on mobile */}
            <SplashCursor color="#3b82f6" opacity={0.12} size={18} />

            <div className="space-y-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Room Overview</h1>
                    <p className="text-slate-500">{selectedLocation?.name}</p>
                </motion.div>

                {/* Room Summary Cards - 4 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                >
                    {/* Total Rooms */}
                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Total Rooms</p>
                                    <p className="text-3xl font-bold text-blue-600">{animatedTotal}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-50">
                                    <IconBuildingSkyscraper size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Occupied Rooms */}
                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Occupied Rooms</p>
                                    <p className="text-3xl font-bold text-red-600">{animatedOccupied}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-red-50">
                                    <IconBuilding size={24} className="text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Available Rooms - Highlighted */}
                    <Card className="bg-white border-emerald-200 shadow-sm ring-1 ring-emerald-100 hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-emerald-600 mb-1 font-medium">Available Now</p>
                                    <p className="text-3xl font-bold text-emerald-600">{animatedAvailable}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-50">
                                    <IconDoor size={24} className="text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Utilization Card */}
                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Utilization</p>
                                    <p className="text-3xl font-bold text-violet-600">{animatedUtilization}%</p>
                                </div>
                                <div className="p-3 rounded-xl bg-violet-50">
                                    <IconChartPie size={24} className="text-violet-600" />
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${utilizationStatus.bgColor} rounded-full`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${utilization}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                    />
                                </div>
                                <p className={`text-xs font-medium ${utilizationStatus.color}`}>
                                    {utilizationStatus.label}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Insight Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-blue-50/50 border border-blue-100 rounded-xl px-5 py-4"
                >
                    <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">{selectedLocation?.name}</span>
                        {' '}is operating at{' '}
                        <span className={`font-semibold ${utilizationStatus.color}`}>{utilization}%</span>
                        {' '}capacity with{' '}
                        <span className="font-semibold text-emerald-600">{availableRooms} room{availableRooms !== 1 ? 's' : ''}</span>
                        {' '}available.
                    </p>
                </motion.div>

                {/* Room Booking Section */}
                <RoomBookingSection />
            </div>
        </>
    );
}
