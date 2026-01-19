import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { locations } from '@/data/locations';

const BookingContext = createContext(null);

// Room data organized by location ID (matching locations.js)
const initialRoomsByLocation = {
    // loc-a: Ideassion Technology (Mount Road) - 6 rooms
    'loc-a': [
        { id: 'mr-1', name: 'Production Room', capacity: 8, pricePerDay: 2500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-2', name: 'Conference Room', capacity: 8, pricePerDay: 3000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        {
            id: 'mr-3',
            name: 'ITS Bay 1',
            capacity: 15,
            pricePerDay: 5000,
            allowSeatSelection: true,
            isOccupied: false,
            bookedSeats: [],
            booking: null,
            seatsMetadata: [
                { id: 0, type: 'Premium', labels: ['Window', 'Corner'] },
                { id: 1, type: 'Premium', labels: ['Window'] },
                { id: 2, type: 'Standard', labels: ['Window'] },
                { id: 3, type: 'Standard', labels: [] },
                { id: 4, type: 'Standard', labels: ['Near AC'] },
                { id: 5, type: 'Premium', labels: ['Quiet Zone'] },
                { id: 6, type: 'Standard', labels: [] },
                { id: 7, type: 'Standard', labels: [] },
                { id: 8, type: 'Standard', labels: ['Quiet Zone'] },
                { id: 9, type: 'Standard', labels: [] },
                { id: 10, type: 'Premium', labels: ['Premium View'] },
                { id: 11, type: 'Standard', labels: [] },
                { id: 12, type: 'Standard', labels: ['Near AC'] },
                { id: 13, type: 'Standard', labels: [] },
                { id: 14, type: 'Premium', labels: ['Quiet Zone', 'Corner'] }
            ]
        },
        {
            id: 'mr-4',
            name: 'ITS Bay 2',
            capacity: 15,
            pricePerDay: 5000,
            allowSeatSelection: true,
            isOccupied: false,
            bookedSeats: [],
            booking: null,
            seatsMetadata: [
                { id: 0, type: 'Premium', labels: ['Window', 'Corner'] },
                { id: 1, type: 'Premium', labels: ['Window'] },
                { id: 2, type: 'Standard', labels: ['Window'] },
                { id: 3, type: 'Standard', labels: [] },
                { id: 4, type: 'Standard', labels: ['Near AC'] },
                { id: 5, type: 'Premium', labels: ['Quiet Zone'] },
                { id: 6, type: 'Standard', labels: [] },
                { id: 7, type: 'Standard', labels: [] },
                { id: 8, type: 'Standard', labels: ['Quiet Zone'] },
                { id: 9, type: 'Standard', labels: [] },
                { id: 10, type: 'Premium', labels: ['Premium View'] },
                { id: 11, type: 'Standard', labels: [] },
                { id: 12, type: 'Standard', labels: ['Near AC'] },
                { id: 13, type: 'Standard', labels: [] },
                { id: 14, type: 'Premium', labels: ['Quiet Zone', 'Corner'] }
            ]
        },
        { id: 'mr-5', name: 'Third Eye', capacity: 12, pricePerDay: 4000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-6', name: 'Manager Room', capacity: 5, pricePerDay: 1500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
    ],
    // loc-b: IITT (Royappettah) - 3 rooms
    'loc-b': [
        { id: 'rp-1', name: 'Production Room', capacity: 5, pricePerDay: 2000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'rp-2', name: 'Conference Room', capacity: 4, pricePerDay: 2500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'rp-3', name: 'Manager Room', capacity: 4, pricePerDay: 1200, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
    ],
    // loc-c: LaunchPod (Perungudi) - 3 rooms
    'loc-c': [
        { id: 'pg-1', name: 'Production Room', capacity: 5, pricePerDay: 2000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'pg-2', name: 'Conference Room', capacity: 4, pricePerDay: 2500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'pg-3', name: 'Manager Room', capacity: 4, pricePerDay: 1200, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
    ],
};

// Generate a short unique company ID
const generateCompanyId = (companyName) => {
    const hash = companyName.toLowerCase().replace(/\s+/g, '') + Date.now().toString(36);
    return 'CMP-' + hash.substring(0, 8).toUpperCase();
};

// Helper to get location name
const getLocationName = (locationId) => {
    const loc = locations.find(l => l.id === locationId);
    return loc?.name || locationId;
};

// Helper to check if a booking is expired (end date has passed)
const isBookingExpired = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return today > end;
};

// Helper to check if booking is currently active (within date range)
const isBookingActive = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
};

// Helper to convert time string (HH:MM) to minutes for comparison
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export function BookingProvider({ children }) {
    const [roomsByLocation, setRoomsByLocation] = useState(initialRoomsByLocation);
    // FRESH STATE: Start with empty completed bookings - NO MOCK DATA
    const [completedBookings, setCompletedBookings] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);
    const [lastBookedRoomId, setLastBookedRoomId] = useState(null);

    // =====================================================
    // BOOKING EXPIRY CHECK & ROOM STATE RECALCULATION
    // =====================================================

    // Check booking statuses and update expired ones
    const checkAndUpdateBookingStatuses = useCallback(() => {
        let hasChanges = false;

        const updatedBookings = completedBookings.map(booking => {
            if (booking.status === 'Active' && isBookingExpired(booking.endDate)) {
                hasChanges = true;
                return { ...booking, status: 'Completed' };
            }
            return booking;
        });

        if (hasChanges) {
            setCompletedBookings(updatedBookings);
        }

        return updatedBookings;
    }, [completedBookings]);

    // Recalculate room occupancy based ONLY on active bookings
    const recalculateRoomStates = useCallback((bookings) => {
        setRoomsByLocation(prev => {
            const newState = { ...prev };

            // Process each location
            Object.keys(newState).forEach(locationId => {
                const locationRooms = [...newState[locationId]];

                // Get only ACTIVE bookings for this location
                const activeBookings = bookings.filter(b =>
                    b.locationId === locationId &&
                    b.status === 'Active' &&
                    isBookingActive(b.startDate, b.endDate)
                );

                // Reset and recalculate each room
                const updatedRooms = locationRooms.map(room => {
                    // Find active bookings for this room
                    const roomActiveBookings = activeBookings.filter(b => b.roomId === room.id);

                    if (roomActiveBookings.length === 0) {
                        // No active bookings - room is available
                        return {
                            ...room,
                            isOccupied: false,
                            bookedSeats: [],
                            booking: null
                        };
                    }

                    // Room has active bookings
                    if (room.allowSeatSelection) {
                        // Seat-based room: collect all booked seats from active bookings
                        const allBookedSeats = roomActiveBookings.flatMap(b => b.selectedSeats || []);
                        const uniqueBookedSeats = [...new Set(allBookedSeats)];
                        const isFullyBooked = uniqueBookedSeats.length >= room.capacity;

                        return {
                            ...room,
                            isOccupied: isFullyBooked,
                            bookedSeats: uniqueBookedSeats,
                            booking: roomActiveBookings[0] ? {
                                startDate: roomActiveBookings[0].startDate,
                                endDate: roomActiveBookings[0].endDate,
                                selectedSeats: uniqueBookedSeats
                            } : null
                        };
                    } else {
                        // Full room booking - check if it's time-based
                        // Time-based bookings should NOT mark room as fully occupied
                        const hasTimeBasedBooking = roomActiveBookings.some(b => b.bookingType === 'time-based');
                        const hasDayBasedBooking = roomActiveBookings.some(b => b.bookingType !== 'time-based');

                        // Room is fully occupied only if there's a day-based booking
                        const isFullyOccupied = hasDayBasedBooking;

                        const latestBooking = roomActiveBookings[0];
                        return {
                            ...room,
                            isOccupied: isFullyOccupied,
                            hasTimeSlotBookings: hasTimeBasedBooking, // New flag for UI to use
                            bookedSeats: [],
                            booking: {
                                startDate: latestBooking.startDate,
                                endDate: latestBooking.endDate,
                                selectedSeats: [],
                                bookingType: latestBooking.bookingType
                            },
                            // Store all time slot bookings for reference
                            timeSlotBookings: roomActiveBookings.filter(b => b.bookingType === 'time-based')
                        };
                    }
                });

                newState[locationId] = updatedRooms;
            });

            return newState;
        });
    }, []);

    // Run expiry check on mount (using setTimeout to avoid synchronous setState)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (completedBookings.length > 0) {
                // Check and update booking statuses
                let hasChanges = false;
                const updatedBookings = completedBookings.map(booking => {
                    if (booking.status === 'Active' && isBookingExpired(booking.endDate)) {
                        hasChanges = true;
                        return { ...booking, status: 'Completed' };
                    }
                    return booking;
                });

                if (hasChanges) {
                    setCompletedBookings(updatedBookings);
                }

                // Recalculate room states
                recalculateRoomStates(updatedBookings);
            }
        }, 0);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount only

    // Also run check periodically (every minute) for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (completedBookings.length > 0) {
                const updatedBookings = checkAndUpdateBookingStatuses();
                recalculateRoomStates(updatedBookings);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [completedBookings, checkAndUpdateBookingStatuses, recalculateRoomStates]);

    // Get rooms for a specific location
    const getRoomsByLocation = useCallback((locationId) => {
        return roomsByLocation[locationId] || [];
    }, [roomsByLocation]);

    // Book a room (full room or with selected seats)
    const bookRoom = useCallback((roomId, bookingDetails, locationId) => {
        const { startDate, endDate, selectedSeats, tenant } = bookingDetails;

        // Update room state
        setRoomsByLocation(prev => {
            const locationRooms = prev[locationId];
            if (!locationRooms) return prev;

            const updatedRooms = locationRooms.map(room => {
                if (room.id !== roomId) return room;

                // For seat-selectable rooms, add seats to bookedSeats
                // For full-room booking, mark as occupied
                const newBookedSeats = room.allowSeatSelection
                    ? [...room.bookedSeats, ...selectedSeats]
                    : [];

                // Room is occupied if:
                // - Full room booking, OR
                // - All seats are booked for Bay rooms
                const isFullyBooked = room.allowSeatSelection
                    ? newBookedSeats.length >= room.capacity
                    : true;

                return {
                    ...room,
                    isOccupied: isFullyBooked,
                    bookedSeats: newBookedSeats,
                    booking: { startDate, endDate, selectedSeats }
                };
            });

            return { ...prev, [locationId]: updatedRooms };
        });

        // If tenant info provided, add to completed bookings
        if (tenant) {
            const room = roomsByLocation[locationId]?.find(r => r.id === roomId);
            const locationName = getLocationName(locationId);

            // Determine company ID:
            // 1. If explicit companyId passed (existing vendor) - use it directly
            // 2. Otherwise check if company name matches existing vendor
            // 3. Otherwise generate new company ID
            const companyName = tenant.companyName || tenant.tenantName || 'Unknown Company';

            let companyId;
            let existingCompany = null;

            if (tenant.companyId) {
                // Existing vendor selected - use the passed companyId directly
                companyId = tenant.companyId;
                existingCompany = completedBookings.find(b => b.companyId === tenant.companyId);
            } else {
                // New vendor - check if name matches existing (case-insensitive)
                existingCompany = completedBookings.find(
                    b => b.companyName.toLowerCase() === companyName.toLowerCase()
                );
                companyId = existingCompany?.companyId || generateCompanyId(companyName);
            }

            const newBooking = {
                id: `bkg-${Date.now()}`,
                companyId,
                companyName,
                contact: {
                    phone: tenant.phone || existingCompany?.contact?.phone || '',
                    email: tenant.email || existingCompany?.contact?.email || '',
                },
                roomId,
                roomName: room?.name || roomId,
                locationId,
                locationName,
                seats: tenant.seatsBooked || selectedSeats?.length || room?.capacity || 0,
                selectedSeats: selectedSeats || [],
                startDate,
                endDate,
                // Time-based booking fields
                bookingType: bookingDetails.bookingType || 'day-based',
                startTime: bookingDetails.startTime || null,
                endTime: bookingDetails.endTime || null,
                dates: bookingDetails.dates || null,
                totalHours: bookingDetails.totalHours || null,
                amount: tenant.amount || 0,
                agreementFile: tenant.agreementFile || '',
                status: 'Active',
                createdAt: new Date().toISOString(),
            };

            setCompletedBookings(prev => [newBooking, ...prev]);
        }

        // Set last booked room for scroll/highlight
        setLastBookedRoomId(roomId);
        setTimeout(() => setLastBookedRoomId(null), 2500);

        // Show success message
        setSuccessMessage('Booking completed successfully');
        setTimeout(() => setSuccessMessage(null), 3000);

        return true;
    }, [roomsByLocation, completedBookings]);

    // Get room by ID across all locations
    const getRoomById = useCallback((roomId) => {
        for (const locationId in roomsByLocation) {
            const room = roomsByLocation[locationId].find(r => r.id === roomId);
            if (room) return room;
        }
        return null;
    }, [roomsByLocation]);

    // Get room stats for a specific location
    const getRoomStats = useCallback((locationId) => {
        const rooms = roomsByLocation[locationId] || [];
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.isOccupied).length;
        const availableRooms = totalRooms - occupiedRooms;
        return { totalRooms, occupiedRooms, availableRooms };
    }, [roomsByLocation]);

    // Get all completed bookings
    const getCompletedBookings = useCallback(() => {
        return completedBookings;
    }, [completedBookings]);

    // Get bookings for a specific location
    const getBookingsByLocation = useCallback((locationId) => {
        return completedBookings.filter(b => b.locationId === locationId);
    }, [completedBookings]);

    // Get bookings for a specific company
    const getVendorBookings = useCallback((companyId) => {
        return completedBookings
            .filter(b => b.companyId === companyId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [completedBookings]);

    // Get unique vendors (companies) from bookings for a specific location
    const getUniqueVendorsByLocation = useCallback((locationId) => {
        const locationBookings = completedBookings.filter(b => b.locationId === locationId);
        const vendorMap = new Map();

        locationBookings.forEach(booking => {
            if (!vendorMap.has(booking.companyId)) {
                // Get ALL bookings for this company (across all locations for stats)
                const allVendorBookings = completedBookings.filter(b => b.companyId === booking.companyId);
                const activeBookings = allVendorBookings.filter(b => b.status === 'Active').length;
                const totalAmount = allVendorBookings.reduce((sum, b) => sum + b.amount, 0);

                vendorMap.set(booking.companyId, {
                    companyId: booking.companyId,
                    companyName: booking.companyName,
                    contact: booking.contact,
                    totalBookings: allVendorBookings.length,
                    activeBookings,
                    totalAmount,
                    firstBookingDate: allVendorBookings
                        .map(b => b.createdAt)
                        .sort()[0],
                });
            }
        });

        return Array.from(vendorMap.values());
    }, [completedBookings]);

    // Get all unique vendors (for backward compatibility)
    const getUniqueVendors = useMemo(() => {
        const vendorMap = new Map();

        completedBookings.forEach(booking => {
            if (!vendorMap.has(booking.companyId)) {
                const vendorBookings = completedBookings.filter(b => b.companyId === booking.companyId);
                const activeBookings = vendorBookings.filter(b => b.status === 'Active').length;
                const totalAmount = vendorBookings.reduce((sum, b) => sum + b.amount, 0);

                vendorMap.set(booking.companyId, {
                    companyId: booking.companyId,
                    companyName: booking.companyName,
                    contact: booking.contact,
                    totalBookings: vendorBookings.length,
                    activeBookings,
                    totalAmount,
                    firstBookingDate: vendorBookings
                        .map(b => b.createdAt)
                        .sort()[0],
                });
            }
        });

        return Array.from(vendorMap.values());
    }, [completedBookings]);

    // Manually trigger expiry check (for location change, etc.)
    const refreshBookingStates = useCallback(() => {
        const updatedBookings = checkAndUpdateBookingStatuses();
        recalculateRoomStates(updatedBookings);
    }, [checkAndUpdateBookingStatuses, recalculateRoomStates]);

    // =====================================================
    // TIME-BASED BOOKING FUNCTIONS
    // =====================================================

    // Get booked time slots for a specific room and date
    const getBookedTimeSlots = useCallback((roomId, date, locationId) => {
        return completedBookings
            .filter(booking => {
                // Check if booking is for this room
                if (booking.roomId !== roomId) return false;
                if (locationId && booking.locationId !== locationId) return false;
                if (booking.status !== 'Active') return false;

                // Check if booking has time slots (time-based booking)
                if (!booking.startTime || !booking.endTime) return false;

                // Check if date matches (for single day) or is in date range (for multi-day)
                if (booking.dates) {
                    return booking.dates.includes(date);
                }
                return booking.date === date;
            })
            .map(booking => ({
                date: booking.date || date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                companyName: booking.companyName,
            }));
    }, [completedBookings]);

    // =====================================================
    // CONFLICT DETECTION FUNCTIONS
    // =====================================================

    // Check if room has ANY hourly bookings on a specific date
    const hasHourlyBookingsOnDate = useCallback((roomId, date, locationId) => {
        return completedBookings.some(booking => {
            if (booking.roomId !== roomId) return false;
            if (locationId && booking.locationId !== locationId) return false;
            if (booking.status !== 'Active') return false;
            if (booking.bookingType !== 'time-based') return false;

            // Check if date matches
            if (booking.dates) {
                return booking.dates.includes(date);
            }
            return booking.date === date || booking.startDate === date;
        });
    }, [completedBookings]);

    // Check if room has ANY day-based bookings on a specific date
    const hasDayBookingsOnDate = useCallback((roomId, date, locationId) => {
        return completedBookings.some(booking => {
            if (booking.roomId !== roomId) return false;
            if (locationId && booking.locationId !== locationId) return false;
            if (booking.status !== 'Active') return false;
            if (booking.bookingType === 'time-based') return false; // Day-based only

            // Check if date is within booking range
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            const checkDate = new Date(date);

            return checkDate >= bookingStart && checkDate <= bookingEnd;
        });
    }, [completedBookings]);

    // Check day-based booking conflict for date range
    const checkDayBookingConflict = useCallback((roomId, startDate, endDate, locationId) => {
        const conflictDates = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];

            // Skip Sundays
            if (current.getDay() !== 0) {
                if (hasHourlyBookingsOnDate(roomId, dateStr, locationId)) {
                    conflictDates.push(dateStr);
                }
            }
            current.setDate(current.getDate() + 1);
        }

        return {
            hasConflict: conflictDates.length > 0,
            conflictDates,
            message: conflictDates.length > 0
                ? `Partial bookings already exist for this room on ${conflictDates.length} date(s). Full-day booking is not available.`
                : null,
        };
    }, [hasHourlyBookingsOnDate]);
    const isTimeSlotAvailable = useCallback((roomId, date, startTime, endTime, locationId) => {
        const bookedSlots = getBookedTimeSlots(roomId, date, locationId);

        const newStart = timeToMinutes(startTime);
        const newEnd = timeToMinutes(endTime);

        return !bookedSlots.some(slot => {
            const slotStart = timeToMinutes(slot.startTime);
            const slotEnd = timeToMinutes(slot.endTime);

            // Check for overlap
            return (newStart < slotEnd && newEnd > slotStart);
        });
    }, [getBookedTimeSlots]);

    // Book room with time slots
    const bookRoomWithTimeSlot = useCallback((roomId, bookingDetails, locationId) => {
        const { date, dates, startTime, endTime, totalHours, totalAmount, pricePerHour, tenant } = bookingDetails;

        // Validate time slot availability for all dates
        const datesToBook = dates || [date];
        for (const d of datesToBook) {
            if (!isTimeSlotAvailable(roomId, d, startTime, endTime, locationId)) {
                return { success: false, error: `Time slot not available on ${d}` };
            }
        }

        const room = roomsByLocation[locationId]?.find(r => r.id === roomId);
        const locationName = getLocationName(locationId);

        // Determine company ID
        const companyName = tenant?.companyName || tenant?.tenantName || 'Unknown Company';
        let companyId;
        let existingCompany = null;

        if (tenant?.companyId) {
            companyId = tenant.companyId;
            existingCompany = completedBookings.find(b => b.companyId === tenant.companyId);
        } else {
            existingCompany = completedBookings.find(
                b => b.companyName.toLowerCase() === companyName.toLowerCase()
            );
            companyId = existingCompany?.companyId || generateCompanyId(companyName);
        }

        const newBooking = {
            id: `bkg-${Date.now()}`,
            companyId,
            companyName,
            contact: {
                phone: tenant?.phone || existingCompany?.contact?.phone || '',
                email: tenant?.email || existingCompany?.contact?.email || '',
            },
            roomId,
            roomName: room?.name || roomId,
            locationId,
            locationName,
            // Time-based booking fields
            date: dates ? dates[0] : date,
            dates: dates || [date],
            startTime,
            endTime,
            totalHours,
            pricePerHour,
            amount: totalAmount,
            // Standard fields
            seats: room?.capacity || 0,
            selectedSeats: [],
            startDate: dates ? dates[0] : date,
            endDate: dates ? dates[dates.length - 1] : date,
            agreementFile: tenant?.agreementFile || '',
            status: 'Active',
            createdAt: new Date().toISOString(),
            bookingType: 'time-based',
        };

        setCompletedBookings(prev => [newBooking, ...prev]);

        // Set last booked room for scroll/highlight
        setLastBookedRoomId(roomId);
        setTimeout(() => setLastBookedRoomId(null), 2500);

        // Show success message
        setSuccessMessage('Time-based booking completed successfully');
        setTimeout(() => setSuccessMessage(null), 3000);

        return { success: true, booking: newBooking };
    }, [roomsByLocation, completedBookings, isTimeSlotAvailable]);

    // Clear success message
    const clearSuccessMessage = useCallback(() => {
        setSuccessMessage(null);
    }, []);

    return (
        <BookingContext.Provider value={{
            roomsByLocation,
            getRoomsByLocation,
            bookRoom,
            getRoomById,
            getRoomStats,
            successMessage,
            clearSuccessMessage,
            lastBookedRoomId,
            // Booking/vendor functions
            completedBookings,
            getCompletedBookings,
            getBookingsByLocation,
            getVendorBookings,
            getUniqueVendors,
            getUniqueVendorsByLocation,
            // Expiry handling
            refreshBookingStates,
            // Time-based booking functions
            getBookedTimeSlots,
            isTimeSlotAvailable,
            bookRoomWithTimeSlot,
            // Conflict detection functions
            hasHourlyBookingsOnDate,
            hasDayBookingsOnDate,
            checkDayBookingConflict,
        }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
}
