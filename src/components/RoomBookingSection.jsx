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
import { useBooking } from '@/context/BookingContext';
import { useLocation } from '@/context/LocationContext';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// Room images
const roomImages = {
    'Production Room': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop',
    'Conference Room': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    'ITS Bay 1': 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop',
    'ITS Bay 2': 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600&h=400&fit=crop',
    'Third Eye': 'https://images.unsplash.com/photo-1552581234-26160f608093?w=600&h=400&fit=crop',
    'Manager Room': 'https://images.unsplash.com/photo-1604328702728-d26d2062c20b?w=600&h=400&fit=crop',
};

const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
};

const formatDateShort = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

function BookingDialog({ room, onClose, onProceedToTenant }) {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedSeats, setSelectedSeats] = useState([]);

    const handleSeatToggle = (seatIndex) => {
        setSelectedSeats(prev =>
            prev.includes(seatIndex)
                ? prev.filter(s => s !== seatIndex)
                : [...prev, seatIndex]
        );
    };

    const totalDays = useMemo(() => calculateDays(startDate, endDate), [startDate, endDate]);

    const totalPrice = useMemo(() => {
        if (room.allowSeatSelection) {
            const pricePerSeat = Math.round(room.pricePerDay / room.capacity);
            return selectedSeats.length * pricePerSeat * totalDays;
        }
        return room.pricePerDay * totalDays;
    }, [room, selectedSeats, totalDays]);

    const canProceed = totalDays > 0 && (!room.allowSeatSelection || selectedSeats.length > 0);

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
        });
    };

    return (
        <DialogContent
            className="bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl"
            style={{ maxWidth: '960px', width: '95vw' }}
        >
            <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100">
                <DialogTitle className="text-2xl font-bold text-slate-900">{room.name}</DialogTitle>
                <DialogDescription className="text-slate-500 text-sm mt-1">
                    {room.allowSeatSelection
                        ? 'Select your preferred seats and booking dates.'
                        : 'Book the entire room for your team.'
                    }
                </DialogDescription>
            </DialogHeader>

            <div className="grid p-8" style={{ gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
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
                                bookedSeats={room.bookedSeats}
                            />
                        ) : (
                            <SeatGrid capacity={room.capacity} />
                        )}
                    </div>
                </div>

                {/* Right Column: Booking Details */}
                <div className="flex flex-col">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                        Booking Period
                    </h4>

                    <div className="grid mb-8" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-medium">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={today}
                                className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-2 font-medium">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                className="w-full h-12 bg-white border border-slate-300 rounded-lg px-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                        Booking Summary
                    </h4>

                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex-1">
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
                                        {totalDays > 0 ? `${totalDays} day${totalDays > 1 ? 's' : ''}` : '—'}
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

                        <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
                            <span className="text-sm text-slate-900 font-bold">Total Price</span>
                            <span className="text-2xl font-bold text-emerald-600">
                                {formatPrice(totalPrice)}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Button
                            variant="outline"
                            className="h-12 px-8 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            disabled={!canProceed}
                            onClick={handleProceed}
                        >
                            Proceed to Assign Tenant
                        </Button>
                    </div>
                </div>
            </div>
        </DialogContent>
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
    const { selectedLocationId, selectedLocation } = useLocation();
    const { getRoomsByLocation, successMessage, lastBookedRoomId, bookRoom } = useBooking();
    const rooms = getRoomsByLocation(selectedLocationId);
    const [openDialogId, setOpenDialogId] = useState(null);
    const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
    const [pendingBooking, setPendingBooking] = useState(null);
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

    const handleTenantConfirm = (tenantData) => {
        if (pendingBooking) {
            // Complete the booking with tenant assignment
            bookRoom(pendingBooking.roomId, {
                startDate: pendingBooking.startDate,
                endDate: pendingBooking.endDate,
                selectedSeats: pendingBooking.selectedSeats,
                tenant: tenantData
            }, selectedLocationId);
        }
        setTenantDialogOpen(false);
        setPendingBooking(null);
    };

    const handleTenantClose = () => {
        setTenantDialogOpen(false);
        setPendingBooking(null);
    };

    const handleTenantBack = () => {
        // Close tenant dialog and reopen booking dialog
        setTenantDialogOpen(false);
        setTimeout(() => {
            if (pendingBooking) {
                setOpenDialogId(pendingBooking.roomId);
            }
        }, 150);
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

                            <CardContent className="px-4 pb-4 flex flex-col gap-4 flex-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">{room.capacity} seats</span>
                                    <span className="text-slate-700 font-medium">{formatPrice(room.pricePerDay)}/day</span>
                                </div>

                                <Dialog
                                    open={openDialogId === room.id}
                                    onOpenChange={(open) => setOpenDialogId(open ? room.id : null)}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={room.isOccupied}
                                        >
                                            {room.isOccupied
                                                ? 'Occupied'
                                                : room.allowSeatSelection
                                                    ? 'Select Seats'
                                                    : 'Book Room'
                                            }
                                        </Button>
                                    </DialogTrigger>
                                    <BookingDialog
                                        room={room}
                                        onClose={() => setOpenDialogId(null)}
                                        onProceedToTenant={handleProceedToTenant}
                                    />
                                </Dialog>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
