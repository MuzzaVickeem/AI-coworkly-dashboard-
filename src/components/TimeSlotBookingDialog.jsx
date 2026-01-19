import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    IconClock,
    IconCalendarEvent,
    IconAlertCircle,
    IconCheck,
    IconArmchair,
    IconStarFilled,
} from '@tabler/icons-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usePricing } from '@/context/PricingContext';

// Business hours configuration
const BUSINESS_START = '09:30';
const BUSINESS_END = '18:30';
const TIME_SLOT_DURATION = 60; // minutes per slot

// Generate time slots from 9:30 AM to 6:30 PM
const generateTimeSlots = () => {
    const slots = [];
    const [startHour, startMin] = BUSINESS_START.split(':').map(Number);
    const [endHour, endMin] = BUSINESS_END.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const time = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')} `;
        slots.push(time);

        currentMin += TIME_SLOT_DURATION;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
    }

    return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Get end time for a slot (next hour)
const getSlotEndTime = (startTime, index) => {
    if (index < TIME_SLOTS.length - 1) {
        return TIME_SLOTS[index + 1];
    }
    return BUSINESS_END;
};

const formatTime = (time24) => {
    const [hour, min] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${hour12}:${min.toString().padStart(2, '0')} ${period} `;
};

const formatPrice = (amount) => `₹${amount?.toLocaleString('en-IN') || 0} `;

const isSunday = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDay() === 0;
};

const formatDateShort = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Get time slot index
const getSlotIndex = (time) => TIME_SLOTS.indexOf(time);

export function TimeSlotBookingDialog({
    isOpen,
    onClose,
    room,
    locationId,
    bookedSlots = [], // Array of { date, startTime, endTime }
    onConfirm,
}) {
    const { getPriceForBookingDate } = usePricing();
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedSlots, setSelectedSlots] = useState([]); // Array of slot indices
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [endDate, setEndDate] = useState(today);
    const [dateError, setDateError] = useState('');

    // Reset slots when date changes
    const handleDateChange = useCallback((newDate) => {
        setSelectedDate(newDate);
        setSelectedSlots([]);
        setDateError('');

        if (isSunday(newDate)) {
            setDateError('Sunday is a holiday. Bookings are not allowed.');
        }
    }, []);

    // Check end date for Sunday
    const handleEndDateChange = useCallback((newEndDate) => {
        setEndDate(newEndDate);
        if (isMultiDay && isSunday(newEndDate)) {
            setDateError('End date falls on Sunday. Please select a different date.');
        } else if (isSunday(selectedDate)) {
            setDateError('Start date falls on Sunday. Please select a different date.');
        } else {
            setDateError('');
        }
    }, [isMultiDay, selectedDate]);

    // Get booked slots for selected date
    const bookedTimesForDate = useMemo(() => {
        return bookedSlots
            .filter(slot => slot.date === selectedDate)
            .map(slot => ({ start: slot.startTime, end: slot.endTime }));
    }, [bookedSlots, selectedDate]);

    // Check if a specific time slot is booked
    const isSlotBooked = useCallback((slotIndex) => {
        return bookedTimesForDate.some(booked => {
            const bookedStartIndex = getSlotIndex(booked.start);
            const bookedEndIndex = getSlotIndex(booked.end);
            return slotIndex >= bookedStartIndex && slotIndex < bookedEndIndex;
        });
    }, [bookedTimesForDate]);



    // Handle slot click
    const handleSlotClick = useCallback((slotIndex) => {
        if (isSlotBooked(slotIndex)) {
            toast.error('This slot is already booked');
            return;
        }

        if (isSunday(selectedDate)) return;

        // If clicking on already selected slot, allow deselection
        if (selectedSlots.includes(slotIndex)) {
            // Deselect: if only one slot, clear all; otherwise shrink from edges
            if (selectedSlots.length === 1) {
                setSelectedSlots([]);
            } else {
                const minSelected = Math.min(...selectedSlots);
                const maxSelected = Math.max(...selectedSlots);

                if (slotIndex === minSelected) {
                    // Remove from start
                    setSelectedSlots(selectedSlots.filter(s => s !== slotIndex));
                } else if (slotIndex === maxSelected) {
                    // Remove from end
                    setSelectedSlots(selectedSlots.filter(s => s !== slotIndex));
                } else {
                    // Clicked in middle - keep from start to before clicked
                    setSelectedSlots(selectedSlots.filter(s => s < slotIndex));
                }
            }
            return;
        }

        if (selectedSlots.length === 0) {
            // First selection
            setSelectedSlots([slotIndex]);
            return;
        }

        const minSelected = Math.min(...selectedSlots);
        const maxSelected = Math.max(...selectedSlots);

        // Check if slot is adjacent
        if (slotIndex === minSelected - 1) {
            // Check if there's a booked slot in between
            setSelectedSlots([slotIndex, ...selectedSlots]);
        } else if (slotIndex === maxSelected + 1) {
            // Check if there's a booked slot in between
            setSelectedSlots([...selectedSlots, slotIndex]);
        } else if (slotIndex >= minSelected && slotIndex <= maxSelected) {
            // Clicked within range - shrink selection
            if (slotIndex < (minSelected + maxSelected) / 2) {
                // Clicked in first half - keep from clicked to end
                const newSlots = selectedSlots.filter(s => s >= slotIndex);
                setSelectedSlots(newSlots);
            } else {
                // Clicked in second half - keep from start to clicked
                const newSlots = selectedSlots.filter(s => s <= slotIndex);
                setSelectedSlots(newSlots);
            }
        } else {
            // Non-adjacent - check for booked slots in between
            const start = Math.min(slotIndex, minSelected);
            const end = Math.max(slotIndex, maxSelected);
            let hasBookedInBetween = false;

            for (let i = start; i <= end; i++) {
                if (isSlotBooked(i)) {
                    hasBookedInBetween = true;
                    break;
                }
            }

            if (hasBookedInBetween) {
                // Start fresh from this slot
                setSelectedSlots([slotIndex]);
            } else {
                // Extend selection to include all slots
                const newSlots = [];
                for (let i = start; i <= end; i++) {
                    newSlots.push(i);
                }
                setSelectedSlots(newSlots);
            }
        }
    }, [selectedSlots, isSlotBooked, selectedDate]);

    // Calculate booking details
    const bookingDetails = useMemo(() => {
        if (selectedSlots.length === 0) return null;

        const currentPricing = getPriceForBookingDate(locationId, room?.id, selectedDate);
        if (!currentPricing) return null;

        // Standardized Logic: Use roomPricePerHour for rooms, seatPricePerHour for seat-based rooms
        const activePricePerHour = room?.allowSeatSelection
            ? currentPricing.seatPricePerHour
            : currentPricing.roomPricePerHour;

        const dailyPrice = room?.allowSeatSelection
            ? currentPricing.seatPricePerDay
            : currentPricing.roomPricePerDay;

        const sortedSlots = [...selectedSlots].sort((a, b) => a - b);
        const firstSlot = sortedSlots[0];
        const lastSlot = sortedSlots[sortedSlots.length - 1];

        const startTime = TIME_SLOTS[firstSlot];
        const endTime = getSlotEndTime(TIME_SLOTS[lastSlot], lastSlot);

        const hours = selectedSlots.length; // Each slot is 1 hour
        const days = isMultiDay ? calculateDaysBetween(selectedDate, endDate) : 1;
        const totalHours = hours * days;

        // PRICING RULES: 
        // 1. ROOM BOOKING: Hourly total is capped by Daily Price
        // 2. SEAT BOOKING: Pricing is LINEAR (no cap as per requirement section 3)
        const hourlyTotal = totalHours * activePricePerHour;
        const capTotal = (dailyPrice || 0) * days;

        const isRoom = !room?.allowSeatSelection;
        const isCapped = isRoom && dailyPrice > 0 && hourlyTotal > capTotal;
        const totalAmount = isCapped ? capTotal : hourlyTotal;

        return {
            startTime,
            endTime,
            hours,
            days,
            totalHours,
            totalAmount,
            hourlyTotal,
            activePrice: activePricePerHour,
            dailyPrice,
            weeklyPrice: isRoom ? currentPricing.roomPricePerWeek : currentPricing.seatPricePerWeek,
            isCapped,
            isRoom,
            appliedEffectiveDate: currentPricing.appliedEffectiveDate,
            isHistorical: currentPricing.isHistoricalAtBooking,
            isPending: currentPricing.isPending,
            isConfigured: activePricePerHour > 0,
            label: room?.allowSeatSelection ? "per seat / hour" : "per room / hour"
        };
    }, [selectedSlots, isMultiDay, selectedDate, endDate, getPriceForBookingDate, locationId, room]);

    const handleConfirm = () => {
        if (!bookingDetails || !bookingDetails.isConfigured || dateError) return;

        const bookingData = {
            date: selectedDate,
            dates: isMultiDay ? getDateRange(selectedDate, endDate) : [selectedDate],
            startTime: bookingDetails.startTime,
            endTime: bookingDetails.endTime,
            totalHours: bookingDetails.totalHours,
            totalAmount: bookingDetails.totalAmount,
            pricePerHour: bookingDetails.activePrice,
            dailyPrice: bookingDetails.dailyPrice,
            weeklyPrice: bookingDetails.weeklyPrice,
            effectiveDateUsed: bookingDetails.appliedEffectiveDate,
        };

        onConfirm(bookingData);
    };

    const canConfirm = selectedSlots.length > 0 && !dateError && bookingDetails?.isConfigured;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                style={{ maxWidth: '900px', width: '95vw' }}
            >
                <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <IconClock size={24} className="text-blue-600" />
                        Time-Based Booking
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm mt-1">
                        {room?.name} • Click slots to select/deselect
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                    {/* Date Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <IconCalendarEvent size={14} className="text-slate-400" />
                                {isMultiDay ? 'Start Date' : 'Booking Date'}
                            </Label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                min={today}
                                className="w-full h-11 bg-white border border-slate-300 rounded-lg px-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {isMultiDay && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <IconCalendarEvent size={14} className="text-slate-400" />
                                    End Date
                                </Label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => handleEndDateChange(e.target.value)}
                                    min={selectedDate}
                                    className="w-full h-11 bg-white border border-slate-300 rounded-lg px-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>

                    {/* Multi-day toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMultiDay(!isMultiDay)}
                            className={cn(
                                "relative h-6 w-11 rounded-full transition-colors duration-200",
                                isMultiDay ? "bg-blue-600" : "bg-slate-200"
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                                    isMultiDay ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                        <span className="text-sm text-slate-600">
                            Multi-day booking with same daily hours
                        </span>
                    </div>

                    {/* Date Error */}
                    <AnimatePresence>
                        {dateError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                            >
                                <IconAlertCircle size={18} className="text-red-500" />
                                <span className="text-sm text-red-700">{dateError}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Time Slot Selector */}
                    {!dateError && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-slate-700">
                                    Select Time Slots (click to select consecutive hours)
                                </Label>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-white border border-slate-300" />
                                        <span className="text-slate-500">Available</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-red-200" />
                                        <span className="text-slate-500">Booked</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-blue-500" />
                                        <span className="text-slate-500">Selected</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Grid - Display as time ranges */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                                    {TIME_SLOTS.map((time, index) => {
                                        const endTime = getSlotEndTime(time, index);
                                        const isBooked = isSlotBooked(index);
                                        const isSelected = selectedSlots.includes(index);

                                        return (
                                            <motion.button
                                                key={time}
                                                whileHover={{ scale: isBooked ? 1 : 1.02 }}
                                                whileTap={{ scale: isBooked ? 1 : 0.98 }}
                                                onClick={() => handleSlotClick(index)}
                                                disabled={isBooked}
                                                className={cn(
                                                    "h-16 rounded-lg flex flex-col items-center justify-center transition-all duration-200 text-sm font-medium relative",
                                                    isBooked && "bg-red-100 text-red-400 cursor-not-allowed",
                                                    !isBooked && !isSelected && "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-blue-300",
                                                    isSelected && "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2",
                                                )}
                                            >
                                                <span className="font-semibold">
                                                    {formatTime(time)} – {formatTime(endTime)}
                                                </span>
                                                <span className={cn(
                                                    "text-xs mt-0.5",
                                                    isBooked ? "text-red-400" : isSelected ? "text-blue-100" : "text-slate-400"
                                                )}>
                                                    {isBooked ? 'Booked' : '1 hour'}
                                                </span>
                                                {isSelected && (
                                                    <IconCheck size={14} className="absolute top-2 right-2" />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Selection Summary */}
                                {selectedSlots.length > 0 && bookingDetails && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 pt-4 border-t border-slate-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                                    Selected: {bookingDetails.hours} hour{bookingDetails.hours > 1 ? 's' : ''}
                                                </Badge>
                                                <span className="text-slate-600 text-sm">
                                                    {formatTime(bookingDetails.startTime)} – {formatTime(bookingDetails.endTime)}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedSlots([])}
                                                className="text-slate-500 hover:text-slate-700"
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Booking Summary */}
                    {bookingDetails && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200"
                        >
                            <h4 className="text-sm font-semibold text-emerald-800 mb-3">
                                Booking Summary
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-emerald-600 text-xs">Date</p>
                                    <p className="font-medium text-emerald-900">
                                        {isMultiDay
                                            ? `${formatDateShort(selectedDate)} – ${formatDateShort(endDate)} `
                                            : formatDateShort(selectedDate)
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-emerald-600 text-xs">Time</p>
                                    <p className="font-medium text-emerald-900">
                                        {formatTime(bookingDetails.startTime)} – {formatTime(bookingDetails.endTime)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-emerald-600 text-xs">Duration</p>
                                    <p className="font-medium text-emerald-900">
                                        {bookingDetails.totalHours} hr{bookingDetails.totalHours > 1 ? 's' : ''}
                                        {isMultiDay && ` (${bookingDetails.hours} hrs × ${bookingDetails.days} days)`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-emerald-600 text-xs">Amount</p>
                                    <p className="font-bold text-lg text-emerald-900">
                                        {room?.allowSeatSelection ? (
                                            <span className="text-sm italic text-slate-500">Total per seat selected</span>
                                        ) : (
                                            formatPrice(bookingDetails.totalAmount)
                                        )}
                                    </p>
                                    <p className="text-emerald-600 text-xs font-medium">
                                        {formatPrice(bookingDetails.activePrice)} {bookingDetails.label}
                                    </p>
                                </div>
                            </div>

                            {/* Calculation Breakdown */}
                            <div className="mt-4 pt-3 border-t border-emerald-100 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-slate-900 font-bold">
                                            {bookingDetails.hours} {bookingDetails.hours === 1 ? 'hour' : 'hours'}
                                            {bookingDetails.days > 1 && ` × ${bookingDetails.days} days`}
                                        </p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                            Applied Price: {formatPrice(bookingDetails.activePrice)} {bookingDetails.label}
                                        </p>
                                        <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                                            <IconCalendarEvent size={10} />
                                            Effective Date: {bookingDetails.appliedEffectiveDate}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-900 leading-tight">
                                            {formatPrice(bookingDetails.totalAmount)}
                                        </p>
                                        {bookingDetails.isHistorical && (
                                            <Badge variant="outline" className="text-[9px] h-4 bg-orange-50 text-orange-600 border-orange-100">
                                                Historical Price
                                            </Badge>
                                        )}
                                        {bookingDetails.isPending && (
                                            <Badge variant="outline" className="text-[9px] h-4 bg-blue-50 text-blue-600 border-blue-100">
                                                Upcoming Price
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {bookingDetails.isCapped && (
                                    <div className="flex items-center gap-2 bg-blue-100/50 p-2.5 rounded-lg border border-blue-200 mt-2">
                                        <div className="bg-blue-600 rounded-full p-0.5">
                                            <IconCheck size={12} className="text-white" />
                                        </div>
                                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">
                                            Daily price applied for full-day room booking (Cap: {formatPrice(bookingDetails.dailyPrice * bookingDetails.days)})
                                        </p>
                                    </div>
                                )}

                                {!bookingDetails.isCapped && bookingDetails.isRoom && bookingDetails.totalHours >= 9 && (
                                    <div className="flex items-center gap-2 bg-slate-100/50 p-2.5 rounded-lg border border-slate-200 mt-2">
                                        <IconAlertCircle size={14} className="text-slate-400" />
                                        <p className="text-[10px] font-medium text-slate-500">
                                            Note: Hourly rate is cheaper than the daily cap of {formatPrice(bookingDetails.dailyPrice)}
                                        </p>
                                    </div>
                                )}

                                {!bookingDetails.isRoom && (
                                    <div className="flex flex-col gap-2 bg-emerald-100/50 p-2.5 rounded-lg border border-emerald-200 mt-2">
                                        <div className="flex items-center gap-2">
                                            <IconArmchair size={14} className="text-emerald-600" />
                                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
                                                Linear seat pricing applied (No cap)
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 pl-5 border-l-2 border-emerald-200 ml-1.5">
                                            <IconStarFilled size={10} className="text-amber-500" />
                                            <p className="text-[9px] text-emerald-600 font-medium italic">
                                                Note: Premium seats carry a 20% surcharge
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <Button
                            variant="outline"
                            className="h-11 px-6 border-slate-300 text-slate-600 hover:bg-slate-50"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-11 px-6 font-semibold"
                            disabled={!canConfirm}
                            onClick={handleConfirm}
                        >
                            Proceed →
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper function to get date range excluding Sundays
function getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        if (current.getDay() !== 0) { // Exclude Sundays
            dates.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

// Calculate days between two dates (excluding Sundays)
function calculateDaysBetween(startDate, endDate) {
    return getDateRange(startDate, endDate).length;
}
