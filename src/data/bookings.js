// Mock booking data for shared-space bookings
// These represent day-pass or hot-desk bookings that affect seat occupancy

export const initialBookings = [
    // Location A bookings
    {
        id: 'booking-1',
        locationId: 'loc-a',
        seatsBooked: 5,
        date: new Date().toISOString().split('T')[0],
        bookedBy: 'Freelancer Group',
    },
    {
        id: 'booking-2',
        locationId: 'loc-a',
        seatsBooked: 3,
        date: new Date().toISOString().split('T')[0],
        bookedBy: 'Meeting Room Overflow',
    },
    // Location B bookings
    {
        id: 'booking-3',
        locationId: 'loc-b',
        seatsBooked: 8,
        date: new Date().toISOString().split('T')[0],
        bookedBy: 'Corporate Workshop',
    },
    {
        id: 'booking-4',
        locationId: 'loc-b',
        seatsBooked: 4,
        date: new Date().toISOString().split('T')[0],
        bookedBy: 'Interview Sessions',
    },
    // Location C bookings
    {
        id: 'booking-5',
        locationId: 'loc-c',
        seatsBooked: 6,
        date: new Date().toISOString().split('T')[0],
        bookedBy: 'Startup Meetup',
    },
];
