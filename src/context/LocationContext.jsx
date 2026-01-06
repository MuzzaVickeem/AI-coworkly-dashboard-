import { createContext, useContext, useState } from 'react';
import { locations } from '@/data/locations';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
    const [selectedLocationId, setSelectedLocationId] = useState(locations[0].id);
    const [allLocations] = useState(locations);

    const selectedLocation = allLocations.find((loc) => loc.id === selectedLocationId);

    const value = {
        selectedLocationId,
        setSelectedLocationId,
        selectedLocation,
        allLocations,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
