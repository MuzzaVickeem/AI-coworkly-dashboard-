import { createContext, useContext, useState, useCallback } from 'react';
import { locations } from '@/data/locations';

const PricingContext = createContext(null);

// Pricing Multipliers
export const SEAT_TYPE_MULTIPLIERS = {
    STANDARD: 1.0,
    PREMIUM: 1.2, // 20% surcharge
};

// Default pricing data organized by location and room
// Standardized to 4 explicit fields: seatPricePerHour, seatPricePerDay, roomPricePerHour, roomPricePerDay
const getDefaultPricing = () => {
    return {
        // loc-a: Ideassion Technology (Mount Road)
        'loc-a': {
            'mr-1': { seatPricePerHour: 300, seatPricePerDay: 2500, seatPricePerWeek: 15000, roomPricePerHour: 1800, roomPricePerDay: 15000, roomPricePerWeek: 90000, effectiveFrom: null, updatedAt: null },
            'mr-2': { seatPricePerHour: 350, seatPricePerDay: 3000, seatPricePerWeek: 18000, roomPricePerHour: 2100, roomPricePerDay: 18000, roomPricePerWeek: 108000, effectiveFrom: null, updatedAt: null },
            'mr-3': { seatPricePerHour: 600, seatPricePerDay: 5000, seatPricePerWeek: 30000, roomPricePerHour: 3600, roomPricePerDay: 30000, roomPricePerWeek: 180000, effectiveFrom: null, updatedAt: null },
            'mr-4': { seatPricePerHour: 600, seatPricePerDay: 5000, seatPricePerWeek: 30000, roomPricePerHour: 3600, roomPricePerDay: 30000, roomPricePerWeek: 180000, effectiveFrom: null, updatedAt: null },
            'mr-5': { seatPricePerHour: 480, seatPricePerDay: 4000, seatPricePerWeek: 24000, roomPricePerHour: 2880, roomPricePerDay: 24000, roomPricePerWeek: 144000, effectiveFrom: null, updatedAt: null },
            'mr-6': { seatPricePerHour: 180, seatPricePerDay: 1500, seatPricePerWeek: 9000, roomPricePerHour: 1080, roomPricePerDay: 9000, roomPricePerWeek: 54000, effectiveFrom: null, updatedAt: null },
        },
        // loc-b: IITT (Royappettah)
        'loc-b': {
            'rp-1': { seatPricePerHour: 240, seatPricePerDay: 2000, seatPricePerWeek: 12000, roomPricePerHour: 1440, roomPricePerDay: 12000, roomPricePerWeek: 72000, effectiveFrom: null, updatedAt: null },
            'rp-2': { seatPricePerHour: 300, seatPricePerDay: 2500, seatPricePerWeek: 15000, roomPricePerHour: 1800, roomPricePerDay: 15000, roomPricePerWeek: 90000, effectiveFrom: null, updatedAt: null },
            'rp-3': { seatPricePerHour: 144, seatPricePerDay: 1200, seatPricePerWeek: 7200, roomPricePerHour: 864, roomPricePerDay: 7200, roomPricePerWeek: 43200, effectiveFrom: null, updatedAt: null },
        },
        // loc-c: LaunchPod (Perungudi)
        'loc-c': {
            'pg-1': { seatPricePerHour: 240, seatPricePerDay: 2000, seatPricePerWeek: 12000, roomPricePerHour: 1440, roomPricePerDay: 12000, roomPricePerWeek: 72000, effectiveFrom: null, updatedAt: null },
            'pg-2': { seatPricePerHour: 300, seatPricePerDay: 2500, seatPricePerWeek: 15000, roomPricePerHour: 1800, roomPricePerDay: 15000, roomPricePerWeek: 90000, effectiveFrom: null, updatedAt: null },
            'pg-3': { seatPricePerHour: 144, seatPricePerDay: 1200, seatPricePerWeek: 7200, roomPricePerHour: 864, roomPricePerDay: 7200, roomPricePerWeek: 43200, effectiveFrom: null, updatedAt: null },
        },
    };
};

export function PricingProvider({ children }) {
    const [pricing, setPricing] = useState(getDefaultPricing);
    // Store historical pricing for past bookings
    const [pricingHistory, setPricingHistory] = useState([]);

    // Get pricing for a specific room
    const getRoomPricing = useCallback((locationId, roomId) => {
        return pricing[locationId]?.[roomId] || null;
    }, [pricing]);

    // Get all pricing for a location
    const getLocationPricing = useCallback((locationId) => {
        return pricing[locationId] || {};
    }, [pricing]);

    // Update pricing for a room
    const updateRoomPricing = useCallback((locationId, roomId, newPricing) => {
        const {
            seatPricePerHour,
            seatPricePerDay,
            seatPricePerWeek,
            roomPricePerHour,
            roomPricePerDay,
            roomPricePerWeek,
            effectiveFrom
        } = newPricing;

        // Validation: No negative values, zero is allowed but will disable the booking type
        if (
            (seatPricePerHour < 0) ||
            (seatPricePerDay < 0) ||
            (seatPricePerWeek < 0) ||
            (roomPricePerHour < 0) ||
            (roomPricePerDay < 0) ||
            (roomPricePerWeek < 0)
        ) {
            return { success: false, error: 'Price values cannot be negative' };
        }

        const now = new Date().toISOString();
        const currentPricing = pricing[locationId]?.[roomId];

        // Save current pricing to history before updating
        if (currentPricing && currentPricing.updatedAt) {
            setPricingHistory(prev => [...prev, {
                locationId,
                roomId,
                ...currentPricing,
                replacedAt: now,
            }]);
        }

        // Update pricing
        setPricing(prev => ({
            ...prev,
            [locationId]: {
                ...prev[locationId],
                [roomId]: {
                    seatPricePerHour: seatPricePerHour !== undefined ? seatPricePerHour : (currentPricing?.seatPricePerHour || 0),
                    seatPricePerDay: seatPricePerDay !== undefined ? seatPricePerDay : (currentPricing?.seatPricePerDay || 0),
                    seatPricePerWeek: seatPricePerWeek !== undefined ? seatPricePerWeek : (currentPricing?.seatPricePerWeek || 0),
                    roomPricePerHour: roomPricePerHour !== undefined ? roomPricePerHour : (currentPricing?.roomPricePerHour || 0),
                    roomPricePerDay: roomPricePerDay !== undefined ? roomPricePerDay : (currentPricing?.roomPricePerDay || 0),
                    roomPricePerWeek: roomPricePerWeek !== undefined ? roomPricePerWeek : (currentPricing?.roomPricePerWeek || 0),
                    effectiveFrom: effectiveFrom || now.split('T')[0],
                    updatedAt: now,
                },
            },
        }));

        return { success: true };
    }, [pricing]);

    // Get pricing that was effective at a specific date (for historical bookings)
    const getPricingAtDate = useCallback((locationId, roomId, date) => {
        const targetDate = new Date(date);

        // Check history for pricing that was effective at that date
        const historicalPricing = pricingHistory
            .filter(p =>
                p.locationId === locationId &&
                p.roomId === roomId &&
                new Date(p.effectiveFrom) <= targetDate &&
                new Date(p.replacedAt) > targetDate
            )
            .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))[0];

        if (historicalPricing) {
            return historicalPricing;
        }

        // Fall back to current pricing if no historical record
        return pricing[locationId]?.[roomId] || null;
    }, [pricing, pricingHistory]);

    // Get price for a booking date - respects effective date for future pricing
    // Returns old price if booking date < effective date, new price otherwise
    const getPriceForBookingDate = useCallback((locationId, roomId, bookingDate) => {
        const currentPricing = pricing[locationId]?.[roomId];
        if (!currentPricing) return null;

        const targetDate = new Date(bookingDate);
        targetDate.setHours(0, 0, 0, 0);

        const effectiveDate = currentPricing.effectiveFrom ? new Date(currentPricing.effectiveFrom) : null;
        if (effectiveDate) effectiveDate.setHours(0, 0, 0, 0);

        // STRICTURE RULE: If booking date is BEFORE effective date, use OLD price
        if (effectiveDate && targetDate < effectiveDate) {
            // Find most recent historical pricing that was replaced AFTER or ON the target date
            // AND was effective BEFORE or ON the target date
            const applicablePricing = pricingHistory
                .filter(p =>
                    p.locationId === locationId &&
                    p.roomId === roomId &&
                    new Date(p.effectiveFrom || 0) <= targetDate
                )
                .sort((a, b) => new Date(b.effectiveFrom || 0) - new Date(a.effectiveFrom || 0))[0];

            if (applicablePricing) {
                return {
                    ...applicablePricing,
                    isHistoricalAtBooking: true,
                    appliedEffectiveDate: applicablePricing.effectiveFrom,
                };
            }

            // Fallback: This might be the first price ever set but it has a future effective date.
            // In a real system, we'd have a 'v0' price. For now, we return current but warn.
            return {
                ...currentPricing,
                isPending: true,
                appliedEffectiveDate: currentPricing.effectiveFrom,
                message: `New pricing takes effect from ${currentPricing.effectiveFrom}`
            };
        }

        // Booking date is ON or AFTER effective date - use current
        return {
            ...currentPricing,
            appliedEffectiveDate: currentPricing.effectiveFrom || 'Current',
        };
    }, [pricing, pricingHistory]);

    // Get location name helper
    const getLocationName = useCallback((locationId) => {
        const loc = locations.find(l => l.id === locationId);
        return loc?.name || locationId;
    }, []);

    const value = {
        pricing,
        getRoomPricing,
        getLocationPricing,
        updateRoomPricing,
        getPricingAtDate,
        getPriceForBookingDate,
        getLocationName,
        pricingHistory,
    };

    return (
        <PricingContext.Provider value={value}>
            {children}
        </PricingContext.Provider>
    );
}

export function usePricing() {
    const context = useContext(PricingContext);
    if (!context) {
        // Return fallback values to prevent crashes
        return {
            pricing: {},
            getRoomPricing: () => null,
            getLocationPricing: () => ({}),
            updateRoomPricing: () => ({ success: false }),
            getPricingAtDate: () => null,
            getPriceForBookingDate: () => null,
            getLocationName: () => '',
            pricingHistory: [],
        };
    }
    return context;
}
