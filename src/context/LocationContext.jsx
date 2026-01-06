import { createContext, useContext, useState, useEffect } from 'react';
import { locations } from '@/data/locations';
import { useAuth } from '@/context/AuthContext';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
    const { selectedCompanyId } = useAuth();
    const [allLocations] = useState(locations);

    // Use the selected company from auth context
    const selectedLocationId = selectedCompanyId || locations[0].id;
    const selectedLocation = allLocations.find((loc) => loc.id === selectedLocationId);

    // For backwards compatibility, also provide a setter (though it won't be used now)
    const setSelectedLocationId = () => {
        // No-op - location is now controlled by company selection
        console.warn('setSelectedLocationId is deprecated. Use company selection instead.');
    };

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
