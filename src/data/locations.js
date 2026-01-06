// Location data for co-working spaces
export const locations = [
    {
        id: 'loc-a',
        name: 'Ideassion Technology',
        totalSeats: 65,
        address: ' Hameed Complex, Anna Salai, Chennai, Tamil Nadu 600006',
    },
    {
        id: 'loc-b',
        name: 'IITT',
        totalSeats: 13,
        address: ' Anna Salai, Chennai, Tamil Nadu 600006',
    },
    {
        id: 'loc-c',
        name: 'LaunchPod',
        totalSeats: 15,
        address: ' Perungudi, Chennai, Tamil Nadu 600066',
    },
];

export const getLocationById = (id) => locations.find((loc) => loc.id === id);
