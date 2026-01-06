// Mock location data for co-working spaces
export const locations = [
    {
        id: 'loc-a',
        name: 'Location A - Downtown',
        totalSeats: 150,
        address: '123 Business District, Downtown',
    },
    {
        id: 'loc-b',
        name: 'Location B - Tech Park',
        totalSeats: 200,
        address: '456 Innovation Hub, Tech Park',
    },
    {
        id: 'loc-c',
        name: 'Location C - Suburban',
        totalSeats: 100,
        address: '789 Green Valley, Suburban',
    },
];

export const getLocationById = (id) => locations.find((loc) => loc.id === id);
