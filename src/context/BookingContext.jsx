import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { locations } from '@/data/locations';

const BookingContext = createContext(null);

// Room data organized by location ID (matching locations.js)
const initialRoomsByLocation = {
    // loc-a: Ideassion Technology (Mount Road) - 6 rooms
    'loc-a': [
        { id: 'mr-1', name: 'Production Room', capacity: 8, pricePerDay: 2500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-2', name: 'Conference Room', capacity: 8, pricePerDay: 3000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-3', name: 'ITS Bay 1', capacity: 15, pricePerDay: 5000, allowSeatSelection: true, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-4', name: 'ITS Bay 2', capacity: 15, pricePerDay: 5000, allowSeatSelection: true, isOccupied: false, bookedSeats: [], booking: null },
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
                        // Full room booking - mark as occupied
                        const latestBooking = roomActiveBookings[0];
                        return {
                            ...room,
                            isOccupied: true,
                            bookedSeats: [],
                            booking: {
                                startDate: latestBooking.startDate,
                                endDate: latestBooking.endDate,
                                selectedSeats: []
                            }
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
