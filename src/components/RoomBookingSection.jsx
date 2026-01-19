import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { SeatGrid } from './SeatGrid';
import { SelectableSeatGrid } from './SelectableSeatGrid';
import { TenantAssignmentDialog } from './TenantAssignmentDialog';
import { TimeSlotBookingDialog } from './TimeSlotBookingDialog';
import { useBooking } from '@/context/BookingContext';
import { useLocation } from '@/context/LocationContext';
import { usePricing, SEAT_TYPE_MULTIPLIERS } from '@/context/PricingContext';
import { IconCheck, IconClock, IconCalendarEvent, IconArmchair, IconStarFilled } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Room images - Professional coworking space images
const roomImages = {
    'Production Room': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop',
    'Conference Room': 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600&h=400&fit=crop',
    'ITS Bay 1': 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop',
    'ITS Bay 2': 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&h=400&fit=crop',
    'Third Eye': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop',
    'Manager Room': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop',
};

const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// Calculate working days (excluding Sundays)
const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return { totalDays: 0, workingDays: 0, excludedSundays: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);

    let workingDays = 0;
    let excludedSundays = 0;
    const current = new Date(start);

    while (current <= end) {
        if (current.getDay() === 0) {
            excludedSundays++;
        } else {
            workingDays++;
        }
        current.setDate(current.getDate() + 1);
    }

    const diffTime = end - start;
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return { totalDays, workingDays, excludedSundays };
};

const formatDateShort = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

function BookingDialog({ room, onClose, onProceedToTenant, onSwitchToHourly, locationId }) {
    const { isDirector } = useAuth();
    const { checkDayBookingConflict } = useBooking();
    const { getPriceForBookingDate } = usePricing();
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [dateError, setDateError] = useState('');

    // Use dynamic pricing based on selected date
    const currentPricing = getPriceForBookingDate(locationId, room.id, startDate);

    // Explicit Pricing Selection
    const dailyPrice = room.allowSeatSelection
        ? currentPricing?.seatPricePerDay
        : currentPricing?.roomPricePerDay;

    const weeklyPrice = room.allowSeatSelection
        ? currentPricing?.seatPricePerWeek
        : currentPricing?.roomPricePerWeek;

    const isConfigured = dailyPrice > 0;

    const [needsEndDateSelection, setNeedsEndDateSelection] = useState(false);

    const handleSeatToggle = (seatIndex) => {
        if (isDirector) return; // Prevent seat selection in View Only mode
        setSelectedSeats(prev =>
            prev.includes(seatIndex)
                ? prev.filter(s => s !== seatIndex)
                : [...prev, seatIndex]
        );
    };

    // Validate dates when they change - auto-clear end date when start changes
    const handleStartDateChange = (value) => {
        setStartDate(value);
        // Auto-clear end date when start date changes
        setEndDate('');
        setNeedsEndDateSelection(true);
        setDateError('Please select an end date');
    };

    const handleEndDateChange = (value) => {
        // Check if end date is a Sunday
        const selectedDate = new Date(value);
        if (selectedDate.getDay() === 0) {
            setDateError('Cannot select Sunday as end date');
            return;
        }
        setEndDate(value);
        setNeedsEndDateSelection(false);
        setDateError('');
    };

    // Calculate working days excluding Sundays
    const { workingDays, excludedSundays } = useMemo(() =>
        calculateWorkingDays(startDate, endDate),
        [startDate, endDate]
    );

    // Check for booking conflicts (hourly bookings on selected dates)
    const conflict = useMemo(() => {
        if (!room?.id || !locationId) return { hasConflict: false, conflictDates: [], message: null };
        return checkDayBookingConflict(room.id, startDate, endDate, locationId);
    }, [room.id, startDate, endDate, locationId, checkDayBookingConflict]);

    // PRICING RULES:
    // 1. Day-based -> DailyPrice × Days
    // 2. Week-based -> WeeklyPrice (For every 6 working days)
    const pricingSummary = useMemo(() => {
        if (!isConfigured) return { total: 0, type: 'N/A' };

        const units = room.allowSeatSelection ? selectedSeats.length : 1;

        // Logic: Use Weekly Price for every 6 working days, daily price for remainder
        if (weeklyPrice > 0 && workingDays >= 6) {
            const weeks = Math.floor(workingDays / 6);
            const extraDays = workingDays % 6;
            const total = (weeks * weeklyPrice + extraDays * dailyPrice) * units;
            return {
                total,
                type: 'Week-based (Discount Applied)',
                breakdown: `${weeks} week${weeks > 1 ? 's' : ''} @ ${formatPrice(weeklyPrice)} ${extraDays > 0 ? `+ ${extraDays} day${extraDays > 1 ? 's' : ''} @ ${formatPrice(dailyPrice)}` : ''}`
            };
        } else {
            const total = (workingDays * dailyPrice) * units;
            return {
                total,
                type: 'Day-based',
                breakdown: `${workingDays} day${workingDays > 1 ? 's' : ''} @ ${formatPrice(dailyPrice)}`
            };
        }
    }, [room, selectedSeats, workingDays, dailyPrice, weeklyPrice, isConfigured]);

    const totalPrice = pricingSummary.total;

    // Cannot proceed if there's a conflict, needs end date selection, or pricing not configured
    const canProceed = isConfigured && workingDays > 0 && !conflict.hasConflict && !needsEndDateSelection && (!room.allowSeatSelection || selectedSeats.length > 0);

    const handleProceed = () => {
        // Pass booking data to tenant assignment
        onProceedToTenant({
            roomId: room.id,
            roomName: room.name,
            seats: room.allowSeatSelection ? selectedSeats.length : room.capacity,
            selectedSeats: selectedSeats,
            amount: totalPrice,
            startDate: startDate,
            endDate: endDate,
            bookingType: pricingSummary.type.toLowerCase().includes('week') ? 'week-based' : 'day-based',
            effectiveDateUsed: currentPricing?.appliedEffectiveDate,
        });
    };

    return (
        <DialogContent
            className="bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            style={{ maxWidth: '960px', width: '95vw' }}
        >
            <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100 flex-shrink-0">
                <DialogTitle className="text-2xl font-bold text-slate-900">{room.name}</DialogTitle>
                <DialogDescription className="text-slate-500 text-sm mt-1">
                    {room.allowSeatSelection
                        ? 'Select your preferred seats and booking dates.'
                        : 'Book the entire room for your team.'
                    }
                </DialogDescription>
            </DialogHeader>

            <div className="grid p-8 overflow-y-auto flex-1" style={{ gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                {/* Left Column: Seat Grid */}
                <div className="flex flex-col">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                        {room.allowSeatSelection ? 'Select Seats' : 'Room Layout'}
                    </h4>
                    <div className="flex-1 flex items-start justify-center bg-slate-50 rounded-xl border border-slate-200 p-6">
                        {room.allowSeatSelection ? (
                            <SelectableSeatGrid
                                capacity={room.capacity}
                                selectedSeats={selectedSeats}
                                onSeatToggle={handleSeatToggle}
                                bookedSeats={room.bookedSeats || []}
                                seatsMetadata={room.seatsMetadata || []}
                            />
                        ) : (
                            <SeatGrid
                                capacity={room.capacity}
                                seatsMetadata={room.seatsMetadata || []}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Booking Details */}
                <div className="flex flex-col">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                        Booking Period
                    </h4>

                    <div className="grid mb-4" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-medium">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                min={today}
                                disabled={isDirector}
                                className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-medium">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                                min={startDate}
                                disabled={isDirector}
                                className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* Sunday Error */}
                    {dateError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <span className="text-red-500 text-sm">⚠</span>
                            <span className="text-sm text-red-700">{dateError}</span>
                        </div>
                    )}

                    {/* Booking Conflict Alert */}
                    {conflict.hasConflict && (
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-xl">
                            <div className="flex items-start gap-3 mb-3">
                                <span className="text-amber-600 text-lg">⚠️</span>
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">
                                        Partial bookings already exist
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        {conflict.message}
                                    </p>
                                </div>
                            </div>
                            <div className="pl-7 space-y-2">
                                <p className="text-xs font-medium text-amber-800 mb-2">Alternative options:</p>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-amber-400 text-amber-700 hover:bg-amber-100"
                                        onClick={() => {
                                            onClose();
                                            if (onSwitchToHourly) onSwitchToHourly(room);
                                        }}
                                    >
                                        📅 Book available hours instead
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-amber-400 text-amber-700 hover:bg-amber-100"
                                        onClick={() => {
                                            // Reset dates to allow selecting different dates
                                            setStartDate(today);
                                            setEndDate(today);
                                        }}
                                    >
                                        🔄 Select different date
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-amber-400 text-amber-700 hover:bg-amber-100"
                                        onClick={onClose}
                                    >
                                        🏢 Select different room
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                        Booking Summary
                    </h4>

                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex-1 space-y-4">
                        <table className="w-full">
                            <tbody className="text-sm">
                                <tr>
                                    <td className="py-2 text-slate-500 w-28">Room</td>
                                    <td className="py-2 text-slate-900 text-right font-medium">{room.name}</td>
                                </tr>
                                {room.allowSeatSelection && (
                                    <tr>
                                        <td className="py-2 text-slate-500">Seats</td>
                                        <td className="py-2 text-slate-900 text-right font-medium">
                                            {selectedSeats.length > 0
                                                ? selectedSeats.map(s => s + 1).sort((a, b) => a - b).join(', ')
                                                : '—'
                                            }
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="py-2 text-slate-500">Duration</td>
                                    <td className="py-2 text-slate-900 text-right font-medium">
                                        {workingDays > 0 ? (
                                            <>
                                                {workingDays} day{workingDays > 1 ? 's' : ''}
                                                {excludedSundays > 0 && (
                                                    <span className="text-orange-500 text-xs block">
                                                        ({excludedSundays} Sunday{excludedSundays > 1 ? 's' : ''} excluded)
                                                    </span>
                                                )}
                                            </>
                                        ) : '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500 font-bold uppercase text-[10px]">Price Type</td>
                                    <td className="py-2 text-blue-700 text-right font-bold text-xs">
                                        {pricingSummary.type}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Rate Used</td>
                                    <td className="py-2 text-slate-900 text-right font-medium">
                                        {isConfigured ? (
                                            workingDays >= 6 && weeklyPrice > 0
                                                ? `${formatPrice(weeklyPrice)} / week`
                                                : `${formatPrice(dailyPrice)} / day`
                                        ) : 'Not configured'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Effective Date</td>
                                    <td className="py-2 text-blue-600 text-right font-bold text-[10px] uppercase">
                                        {currentPricing?.appliedEffectiveDate || 'Current'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-slate-500">Dates</td>
                                    <td className="py-2 text-slate-900 text-right font-medium">
                                        {formatDateShort(startDate)} → {formatDateShort(endDate)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-900 font-bold">Total Price</span>
                                {room.allowSeatSelection && selectedSeats.length === 0 ? (
                                    <span className="text-sm text-slate-400 italic">
                                        Select seats to calculate amount
                                    </span>
                                ) : (
                                    <span className="text-2xl font-bold text-emerald-600">
                                        {formatPrice(totalPrice)}
                                    </span>
                                )}
                            </div>

                            {isConfigured && (room.allowSeatSelection ? selectedSeats.length > 0 : true) && workingDays > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500 italic">
                                    <span className="font-bold not-italic">Breakdown:</span>
                                    {room.allowSeatSelection
                                        ? `${selectedSeats.length} seat${selectedSeats.length !== 1 ? 's' : ''} × (${pricingSummary.breakdown}) = ${formatPrice(totalPrice)}`
                                        : `(${pricingSummary.breakdown}) = ${formatPrice(totalPrice)}`
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Button
                            variant="outline"
                            className="h-12 px-8 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            onClick={onClose}
                            showInViewOnly={true}
                        >
                            {isDirector ? 'Close' : 'Cancel'}
                        </Button>
                        {!isDirector && (
                            <Button
                                className="h-12 px-8 font-semibold"
                                disabled={!canProceed}
                                onClick={handleProceed}
                            >
                                Proceed to Assign Tenant
                            </Button>
                        )}
                    </div>
                </div>
            </div >
        </DialogContent >
    );
}

// Success Toast
function SuccessToast({ message }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-xl shadow-2xl"
        >
            <IconCheck size={22} strokeWidth={3} />
            <span className="font-semibold text-base">{message}</span>
        </motion.div>
    );
}

export function RoomBookingSection() {
    const { isDirector } = useAuth();
    const { selectedLocationId, selectedLocation } = useLocation();
    const { getRoomsByLocation, successMessage, lastBookedRoomId, bookRoom, getBookedTimeSlots } = useBooking();
    const { getRoomPricing } = usePricing();
    const rooms = getRoomsByLocation(selectedLocationId);
    const [openDialogId, setOpenDialogId] = useState(null);
    const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [timeSlotDialogOpen, setTimeSlotDialogOpen] = useState(false);
    const [selectedRoomForTimeSlot, setSelectedRoomForTimeSlot] = useState(null);
    const [seatSelectionDialogOpen, setSeatSelectionDialogOpen] = useState(false);
    const cardRefs = useRef({});

    // Scroll to booked room card
    useEffect(() => {
        if (lastBookedRoomId && cardRefs.current[lastBookedRoomId]) {
            setTimeout(() => {
                cardRefs.current[lastBookedRoomId]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }, [lastBookedRoomId]);

    const handleProceedToTenant = (bookingData) => {
        setPendingBooking(bookingData);
        setOpenDialogId(null); // Close booking dialog
        setTimeout(() => setTenantDialogOpen(true), 150); // Open tenant dialog
    };

    // Time-slot booking handlers
    const handleOpenTimeSlotBooking = (room) => {
        setSelectedRoomForTimeSlot(room);
        setTimeSlotDialogOpen(true);
    };

    const handleTimeSlotConfirm = (bookingData) => {
        if (!selectedRoomForTimeSlot) return;

        // For seat-based rooms (Bay 1/2), show seat selection screen first
        if (selectedRoomForTimeSlot.allowSeatSelection) {
            // Store time slot booking data and open seat selection dialog
            setPendingBooking({
                ...bookingData,
                roomId: selectedRoomForTimeSlot.id,
                roomName: selectedRoomForTimeSlot.name,
                seats: selectedRoomForTimeSlot.capacity,
                selectedSeats: [],
                amount: bookingData.totalAmount,
                startDate: bookingData.dates?.[0] || bookingData.date,
                endDate: bookingData.dates?.[bookingData.dates.length - 1] || bookingData.date,
                bookingType: 'time-based',
                needsSeatSelection: true,
            });
            setTimeSlotDialogOpen(false);
            // Open seat selection dialog
            setTimeout(() => setSeatSelectionDialogOpen(true), 150);
            return;
        }

        // For non-seat-based rooms, proceed directly to tenant assignment
        setPendingBooking({
            ...bookingData,
            roomId: selectedRoomForTimeSlot.id,
            roomName: selectedRoomForTimeSlot.name,
            seats: selectedRoomForTimeSlot.capacity,
            selectedSeats: [],
            amount: bookingData.totalAmount,
            startDate: bookingData.dates?.[0] || bookingData.date,
            endDate: bookingData.dates?.[bookingData.dates.length - 1] || bookingData.date,
            bookingType: 'time-based',
        });
        setTimeSlotDialogOpen(false);
        setTimeout(() => setTenantDialogOpen(true), 150);
    };

    const handleTimeSlotClose = () => {
        setTimeSlotDialogOpen(false);
        setSelectedRoomForTimeSlot(null);
    };

    const handleTenantConfirm = (tenantData) => {
        if (pendingBooking) {
            // Complete the booking with tenant assignment
            bookRoom(pendingBooking.roomId, {
                startDate: pendingBooking.startDate,
                endDate: pendingBooking.endDate,
                selectedSeats: pendingBooking.selectedSeats,
                // Time-based booking fields
                bookingType: pendingBooking.bookingType || 'day-based',
                startTime: pendingBooking.startTime || null,
                endTime: pendingBooking.endTime || null,
                dates: pendingBooking.dates || null,
                totalHours: pendingBooking.totalHours || null,
                tenant: tenantData
            }, selectedLocationId);
        }
        setTenantDialogOpen(false);
        setPendingBooking(null);
        setSelectedRoomForTimeSlot(null);
    };

    const handleTenantClose = () => {
        setTenantDialogOpen(false);
        setPendingBooking(null);
        setSelectedRoomForTimeSlot(null);
    };

    const handleTenantBack = () => {
        // Close tenant dialog and reopen the appropriate booking dialog
        setTenantDialogOpen(false);

        if (pendingBooking?.bookingType === 'time-based') {
            // Return to time slot dialog with preserved room
            const room = rooms.find(r => r.id === pendingBooking.roomId);
            if (room) {
                setSelectedRoomForTimeSlot(room);
                setTimeout(() => setTimeSlotDialogOpen(true), 150);
            }
        } else {
            // Return to day-based booking dialog
            setTimeout(() => {
                if (pendingBooking) {
                    setOpenDialogId(pendingBooking.roomId);
                }
            }, 150);
        }
    };

    return (
        <section className="space-y-6 pt-8 border-t border-slate-200">
            <AnimatePresence>
                {successMessage && <SuccessToast message={successMessage} />}
            </AnimatePresence>

            {/* Tenant Assignment Dialog */}
            <TenantAssignmentDialog
                isOpen={tenantDialogOpen}
                onClose={handleTenantClose}
                onBack={handleTenantBack}
                bookingData={pendingBooking}
                onConfirm={handleTenantConfirm}
            />

            {/* Time Slot Booking Dialog */}
            {selectedRoomForTimeSlot && (
                <TimeSlotBookingDialog
                    isOpen={timeSlotDialogOpen}
                    onClose={handleTimeSlotClose}
                    room={selectedRoomForTimeSlot}
                    locationId={selectedLocationId}
                    bookedSlots={getBookedTimeSlots(selectedRoomForTimeSlot.id, new Date().toISOString().split('T')[0], selectedLocationId)}
                    onConfirm={handleTimeSlotConfirm}
                />
            )}

            {/* Seat Selection Dialog for Time-Based Booking (Bay 1/2) */}
            {seatSelectionDialogOpen && pendingBooking && selectedRoomForTimeSlot && (
                <Dialog open={seatSelectionDialogOpen} onOpenChange={(open) => !open && setSeatSelectionDialogOpen(false)}>
                    <DialogContent
                        className="bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                        style={{ maxWidth: '720px', width: '95vw' }}
                    >
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0 bg-slate-50">
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                Select Seats — {selectedRoomForTimeSlot.name}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm">
                                {formatDateShort(pendingBooking.startDate)} at {pendingBooking.startTime} – {pendingBooking.endTime}. Please select your seats.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Seat Selection Grid */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Your Seats</h4>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <SelectableSeatGrid
                                        capacity={selectedRoomForTimeSlot.capacity}
                                        selectedSeats={pendingBooking.selectedSeats || []}
                                        bookedSeats={selectedRoomForTimeSlot.bookedSeats || []}
                                        seatsMetadata={selectedRoomForTimeSlot.seatsMetadata || []}
                                        onSeatToggle={(seatIndex) => {
                                            const current = pendingBooking.selectedSeats || [];
                                            const updated = current.includes(seatIndex)
                                                ? current.filter(s => s !== seatIndex)
                                                : [...current, seatIndex];
                                            setPendingBooking({ ...pendingBooking, selectedSeats: updated });
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {(pendingBooking.selectedSeats || []).length} seat{(pendingBooking.selectedSeats || []).length !== 1 ? 's' : ''} selected
                                </p>
                            </div>

                            {/* Updated Price */}
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                {(() => {
                                    // SEAT PRICING RULE: Respect Seat Type (Premium/Standard)
                                    const metadataList = selectedRoomForTimeSlot.seatsMetadata || [];
                                    const totalAmount = (pendingBooking.selectedSeats || []).reduce((sum, seatIndex) => {
                                        const metadata = metadataList.find(m => m.id === seatIndex) || { type: 'Standard' };
                                        const multiplier = metadata.type === 'Premium' ? SEAT_TYPE_MULTIPLIERS.PREMIUM : SEAT_TYPE_MULTIPLIERS.STANDARD;
                                        return sum + (pendingBooking.pricePerHour * multiplier * pendingBooking.totalHours);
                                    }, 0);

                                    const premiumSelectedCount = (pendingBooking.selectedSeats || []).filter(idx => {
                                        const m = metadataList.find(meta => meta.id === idx);
                                        return m?.type === 'Premium';
                                    }).length;

                                    return (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-emerald-700 font-medium">Total Amount</span>
                                                {(pendingBooking.selectedSeats?.length || 0) === 0 ? (
                                                    <span className="text-sm text-slate-400 italic">
                                                        Select seats to calculate amount
                                                    </span>
                                                ) : (
                                                    <div className="text-right">
                                                        <span className="text-2xl font-bold text-emerald-600">
                                                            {formatPrice(totalAmount)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {(pendingBooking.selectedSeats?.length || 0) > 0 && (
                                                <div className="mt-3 pt-3 border-t border-emerald-100/50 flex flex-col gap-1">
                                                    <p className="text-xs text-emerald-600 font-medium">
                                                        {formatPrice(pendingBooking.pricePerHour)} per seat / hour
                                                    </p>
                                                    <p className="text-[10px] text-emerald-500 italic pb-1">
                                                        <span className="font-bold not-italic text-emerald-700">Breakdown:</span>{" "}
                                                        {pendingBooking.selectedSeats?.length} seat{pendingBooking.selectedSeats?.length > 1 ? 's' : ''} × {formatPrice(pendingBooking.pricePerHour)} × {pendingBooking.totalHours} hr{pendingBooking.totalHours > 1 ? 's' : ''}
                                                    </p>
                                                    <div className="flex flex-col gap-1.5 bg-emerald-100/50 p-2.5 rounded-lg border border-emerald-200">
                                                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
                                                            Linear seat pricing applied {pendingBooking.dailyPrice > 0 && `(No cap at ${formatPrice(pendingBooking.dailyPrice)})`}
                                                        </p>
                                                        {premiumSelectedCount > 0 && (
                                                            <p className="text-[9px] text-amber-600 font-bold flex items-center gap-1">
                                                                <IconStarFilled size={10} />
                                                                Includes {premiumSelectedCount} Premium seat(s) with 20% surcharge
                                                            </p>
                                                        )}
                                                        <p className="text-[9px] text-blue-600 font-bold flex items-center gap-1">
                                                            <IconCalendarEvent size={10} />
                                                            Effective Date: {pendingBooking.effectiveDateUsed || 'Current'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 p-6 border-t border-slate-100 flex-shrink-0">
                            <Button
                                variant="outline"
                                className="h-11 px-6"
                                onClick={() => {
                                    setSeatSelectionDialogOpen(false);
                                    // Reopen time slot dialog
                                    setTimeout(() => setTimeSlotDialogOpen(true), 150);
                                }}
                            >
                                ← Go Back
                            </Button>
                            <Button
                                className="h-11 px-6 font-semibold"
                                disabled={(pendingBooking.selectedSeats?.length || 0) === 0}
                                onClick={() => {
                                    // Update pending booking with selected seats and proceed to tenant
                                    // Respect Seat Type (Premium/Standard)
                                    const metadataList = selectedRoomForTimeSlot.seatsMetadata || [];
                                    const finalAmount = (pendingBooking.selectedSeats || []).reduce((sum, seatIndex) => {
                                        const metadata = metadataList.find(m => m.id === seatIndex) || { type: 'Standard' };
                                        const multiplier = metadata.type === 'Premium' ? SEAT_TYPE_MULTIPLIERS.PREMIUM : SEAT_TYPE_MULTIPLIERS.STANDARD;
                                        return sum + (pendingBooking.pricePerHour * multiplier * pendingBooking.totalHours);
                                    }, 0);

                                    setPendingBooking({ ...pendingBooking, amount: finalAmount });
                                    setSeatSelectionDialogOpen(false);
                                    setTimeout(() => setTenantDialogOpen(true), 150);
                                }}
                            >
                                Assign Tenant →
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h2 className="text-xl font-bold text-slate-900 mb-2">Room Booking – {selectedLocation?.name || 'Select Location'}</h2>
                <p className="text-slate-500 text-sm">Select a room to view details and book.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => {
                    const isHighlighted = lastBookedRoomId === room.id;
                    const roomPricing = getRoomPricing(selectedLocationId, room.id);

                    return (
                        <Card
                            key={room.id}
                            ref={(el) => cardRefs.current[room.id] = el}
                            className={cn(
                                "bg-white border-slate-200 overflow-hidden transition-all duration-300 flex flex-col p-0 shadow-sm hover:shadow-lg",
                                isHighlighted
                                    ? "ring-2 ring-emerald-500 ring-offset-2 shadow-lg shadow-emerald-100"
                                    : "hover:border-slate-300"
                            )}
                        >
                            <div className="relative">
                                <img
                                    src={roomImages[room.name]}
                                    alt={room.name}
                                    className="aspect-video object-cover w-full"
                                />
                                {room.isOccupied && (
                                    <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">
                                        Occupied
                                    </Badge>
                                )}
                            </div>

                            <CardHeader className="px-4 pt-4 pb-2">
                                <CardTitle className="text-lg font-semibold text-slate-900 text-left">{room.name}</CardTitle>
                            </CardHeader>

                            <CardContent className="px-4 pb-4 flex flex-col gap-3 flex-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">{room.capacity} seats</span>
                                    <div className="text-right">
                                        <div className="text-slate-700 font-medium">
                                            {roomPricing?.roomPricePerDay ? `${formatPrice(roomPricing.roomPricePerDay)}/day` : 'N/A'}
                                        </div>
                                        <div className="text-slate-400 text-[10px]">
                                            {roomPricing?.roomPricePerHour ? `${formatPrice(roomPricing.roomPricePerHour)}/hr` : 'Hourly N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Buttons */}
                                <div className="flex gap-2 mt-auto">
                                    {/* Day-based booking */}
                                    <Dialog
                                        open={openDialogId === room.id}
                                        onOpenChange={(open) => setOpenDialogId(open ? room.id : null)}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs py-2 px-3 h-auto"
                                                disabled={room.isOccupied && !isDirector}
                                                showInViewOnly={true}
                                            >
                                                <IconCalendarEvent size={14} className="mr-1" />
                                                {room.isOccupied
                                                    ? 'Full'
                                                    : isDirector
                                                        ? 'View'
                                                        : 'Day'
                                                }
                                            </Button>
                                        </DialogTrigger>
                                        <BookingDialog
                                            room={room}
                                            onClose={() => setOpenDialogId(null)}
                                            onProceedToTenant={handleProceedToTenant}
                                            onSwitchToHourly={() => {
                                                setOpenDialogId(null);
                                                handleOpenTimeSlotBooking(room);
                                            }}
                                            locationId={selectedLocationId}
                                        />
                                    </Dialog>

                                    {/* Time-based booking (hourly) */}
                                    {!isDirector && !room.isOccupied && (
                                        <Button
                                            className="flex-1 text-xs py-2 px-3 h-auto"
                                            onClick={() => handleOpenTimeSlotBooking(room)}
                                        >
                                            <IconClock size={14} className="mr-1" />
                                            Hourly
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section >
    );
}
