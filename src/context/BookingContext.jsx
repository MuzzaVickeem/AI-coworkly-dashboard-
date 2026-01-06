import { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext(null);

// Room data organized by location
const initialRoomsByLocation = {
    // Mount Road - 6 rooms (existing)
    'mount-road': [
        { id: 'mr-1', name: 'Production Room', capacity: 8, pricePerDay: 2500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-2', name: 'Conference Room', capacity: 8, pricePerDay: 3000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-3', name: 'ITS Bay 1', capacity: 15, pricePerDay: 5000, allowSeatSelection: true, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-4', name: 'ITS Bay 2', capacity: 15, pricePerDay: 5000, allowSeatSelection: true, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-5', name: 'Third Eye', capacity: 12, pricePerDay: 4000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'mr-6', name: 'Manager Room', capacity: 5, pricePerDay: 1500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
    ],
    // Royappettah - 3 rooms (new)
    'royappettah': [
        { id: 'rp-1', name: 'Production Room', capacity: 5, pricePerDay: 2000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'rp-2', name: 'Conference Room', capacity: 4, pricePerDay: 2500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'rp-3', name: 'Manager Room', capacity: 4, pricePerDay: 1200, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
    ],
    // Perungudi - 3 rooms (new)
    'perungudi': [
        { id: 'pg-1', name: 'Production Room', capacity: 5, pricePerDay: 2000, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'pg-2', name: 'Conference Room', capacity: 4, pricePerDay: 2500, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
        { id: 'pg-3', name: 'Manager Room', capacity: 4, pricePerDay: 1200, allowSeatSelection: false, isOccupied: false, bookedSeats: [], booking: null },
    ],
};

export function BookingProvider({ children }) {
    const [roomsByLocation, setRoomsByLocation] = useState(initialRoomsByLocation);
    const [successMessage, setSuccessMessage] = useState(null);
    const [lastBookedRoomId, setLastBookedRoomId] = useState(null);

    // Get rooms for a specific location
    const getRoomsByLocation = useCallback((locationId) => {
        return roomsByLocation[locationId] || [];
    }, [roomsByLocation]);

    // Book a room (full room or with selected seats)
    const bookRoom = useCallback((roomId, bookingDetails, locationId) => {
        const { startDate, endDate, selectedSeats } = bookingDetails;

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

        // Set last booked room for scroll/highlight
        setLastBookedRoomId(roomId);
        setTimeout(() => setLastBookedRoomId(null), 2500);

        // Show success message
        setSuccessMessage('Booking completed successfully');
        setTimeout(() => setSuccessMessage(null), 3000);

        return true;
    }, []);

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
            lastBookedRoomId
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
