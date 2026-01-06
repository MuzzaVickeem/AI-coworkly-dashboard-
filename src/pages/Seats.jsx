import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IconArmchair2, IconArmchair, IconUsers } from '@tabler/icons-react';
import { useLocation } from '@/context/LocationContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function Seats() {
    const { selectedLocationId, selectedLocation } = useLocation();
    const { calculateLocationKPIs, getActiveTenantsByLocation, getBookingsByLocation } = useData();
    const [kpis, setKpis] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const locationKPIs = calculateLocationKPIs(selectedLocationId);
        setKpis(locationKPIs);
        setTenants(getActiveTenantsByLocation(selectedLocationId));
        setBookings(getBookingsByLocation(selectedLocationId));
    }, [selectedLocationId, calculateLocationKPIs, getActiveTenantsByLocation, getBookingsByLocation]);

    if (!kpis) return null;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1 className="text-2xl font-bold text-white mb-1">Seat Overview</h1>
                <p className="text-neutral-400">{selectedLocation?.name}</p>
            </motion.div>

            {/* Seat Summary Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Total Capacity</p>
                                <p className="text-3xl font-bold text-white">{kpis.totalSeats}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/20">
                                <IconArmchair2 size={24} className="text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/20 to-green-600/5 border-green-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Occupied</p>
                                <p className="text-3xl font-bold text-white">{kpis.occupiedSeats}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-500/20">
                                <IconArmchair size={24} className="text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Available</p>
                                <p className="text-3xl font-bold text-white">{kpis.vacantSeats}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/20">
                                <IconArmchair size={24} className="text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Occupancy Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-neutral-900/50 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Occupancy Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-400">Current occupancy</span>
                                <span className="text-2xl font-bold text-white">{kpis.occupancyPercentage}%</span>
                            </div>
                            <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${kpis.occupancyPercentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={cn(
                                        'h-full rounded-full',
                                        kpis.occupancyPercentage >= 80
                                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                                            : kpis.occupancyPercentage >= 50
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                                                : 'bg-gradient-to-r from-amber-500 to-amber-400'
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Seat Allocation Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tenant Allocations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-neutral-900/50 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                <IconUsers size={20} className="text-purple-400" />
                                Tenant Allocations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {tenants.length === 0 ? (
                                    <p className="text-neutral-500 text-center py-4">No active tenants</p>
                                ) : (
                                    tenants.map((tenant) => (
                                        <div
                                            key={tenant.id}
                                            className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-white">{tenant.name}</p>
                                                <p className="text-sm text-neutral-400">Since {tenant.startDate}</p>
                                            </div>
                                            <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                                                {tenant.seatsAllocated} seats
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Today's Bookings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-neutral-900/50 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                <IconArmchair size={20} className="text-blue-400" />
                                Today's Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bookings.length === 0 ? (
                                    <p className="text-neutral-500 text-center py-4">No bookings today</p>
                                ) : (
                                    bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-white">{booking.bookedBy}</p>
                                                <p className="text-sm text-neutral-400">{booking.date}</p>
                                            </div>
                                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                                {booking.seatsBooked} seats
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
