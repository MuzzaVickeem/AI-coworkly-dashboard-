import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconBuilding, IconBuildingSkyscraper, IconDoor, IconChartPie } from '@tabler/icons-react';
import { useLocation } from '@/context/LocationContext';
import { useBooking } from '@/context/BookingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RoomBookingSection } from '@/components/RoomBookingSection';

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
    if (percentage < 40) return { label: 'Underutilized', color: 'text-yellow-400', bgColor: 'bg-yellow-500' };
    if (percentage <= 75) return { label: 'Healthy', color: 'text-green-400', bgColor: 'bg-green-500' };
    return { label: 'High Demand', color: 'text-orange-400', bgColor: 'bg-orange-500' };
}

export function Seats() {
    const { selectedLocation, selectedLocationId } = useLocation();
    const { getRoomStats } = useBooking();

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
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1 className="text-2xl font-bold text-white mb-1">Room Overview</h1>
                <p className="text-neutral-400">{selectedLocation?.name}</p>
            </motion.div>

            {/* Room Summary Cards - 4 columns */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Total Rooms */}
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Total Rooms</p>
                                <p className="text-3xl font-bold text-white">{animatedTotal}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/20">
                                <IconBuildingSkyscraper size={24} className="text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Occupied Rooms */}
                <Card className="bg-gradient-to-br from-red-500/20 to-red-600/5 border-red-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Occupied Rooms</p>
                                <p className="text-3xl font-bold text-white">{animatedOccupied}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-red-500/20">
                                <IconBuilding size={24} className="text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Rooms - Highlighted */}
                <Card className="bg-gradient-to-br from-green-500/20 to-green-600/5 border-green-500/30 ring-1 ring-green-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-300 mb-1">Available Now</p>
                                <p className="text-3xl font-bold text-white">{animatedAvailable}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-500/20">
                                <IconDoor size={24} className="text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Utilization Card - NEW */}
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Utilization</p>
                                <p className="text-3xl font-bold text-white">{animatedUtilization}%</p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-500/20">
                                <IconChartPie size={24} className="text-purple-400" />
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
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
                className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg px-4 py-3"
            >
                <p className="text-sm text-neutral-300">
                    <span className="font-medium text-white">{selectedLocation?.name}</span>
                    {' '}is operating at{' '}
                    <span className={`font-semibold ${utilizationStatus.color}`}>{utilization}%</span>
                    {' '}capacity with{' '}
                    <span className="font-semibold text-green-400">{availableRooms} room{availableRooms !== 1 ? 's' : ''}</span>
                    {' '}available.
                </p>
            </motion.div>

            {/* Room Booking Section */}
            <RoomBookingSection />
        </div>
    );
}
