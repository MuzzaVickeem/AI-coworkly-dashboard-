import { createContext, useContext, useState, useMemo } from 'react';
import { initialTenants } from '@/data/tenants';
import { initialStaff } from '@/data/staff';
import { initialAttendance } from '@/data/attendance';
import { initialBookings } from '@/data/bookings';
import { locations } from '@/data/locations';

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const [tenants, setTenants] = useState(initialTenants);
    const [staff] = useState(initialStaff);
    const [attendance, setAttendance] = useState(initialAttendance);
    const [bookings] = useState(initialBookings);

    // Tenant CRUD operations
    const addTenant = (tenant) => {
        const newTenant = {
            ...tenant,
            id: `tenant-${Date.now()}`,
        };
        setTenants((prev) => [...prev, newTenant]);
        return newTenant;
    };

    const updateTenant = (id, updates) => {
        setTenants((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    };

    const deleteTenant = (id) => {
        setTenants((prev) => prev.filter((t) => t.id !== id));
    };

    // Get tenants by location
    const getTenantsByLocation = (locationId) => {
        return tenants.filter((t) => t.locationId === locationId);
    };

    // Get active tenants by location
    const getActiveTenantsByLocation = (locationId) => {
        return tenants.filter((t) => t.locationId === locationId && t.status === 'Active');
    };

    // Get staff by location
    const getStaffByLocation = (locationId) => {
        return staff.filter((s) => s.locationId === locationId);
    };

    // Attendance operations
    const updateAttendance = (staffId, date, updates) => {
        setAttendance((prev) =>
            prev.map((a) =>
                a.staffId === staffId && a.date === date ? { ...a, ...updates } : a
            )
        );
    };

    const getAttendanceByDate = (date) => {
        return attendance.filter((a) => a.date === date);
    };

    const getAttendanceByLocationAndDate = (locationId, date) => {
        const locationStaff = staff.filter((s) => s.locationId === locationId);
        const staffIds = locationStaff.map((s) => s.id);
        return attendance.filter((a) => staffIds.includes(a.staffId) && a.date === date);
    };

    // Get bookings by location for today
    const getBookingsByLocation = (locationId) => {
        const today = new Date().toISOString().split('T')[0];
        return bookings.filter((b) => b.locationId === locationId && b.date === today);
    };

    // Calculate KPIs for a location
    const calculateLocationKPIs = (locationId) => {
        const location = locations.find((l) => l.id === locationId);
        if (!location) return null;

        const activeTenants = getActiveTenantsByLocation(locationId);
        const locationBookings = getBookingsByLocation(locationId);

        const tenantSeats = activeTenants.reduce((sum, t) => sum + t.seatsAllocated, 0);
        const bookingSeats = locationBookings.reduce((sum, b) => sum + b.seatsBooked, 0);
        const occupiedSeats = tenantSeats + bookingSeats;
        const vacantSeats = location.totalSeats - occupiedSeats;
        const occupancyPercentage = Math.round((occupiedSeats / location.totalSeats) * 100);

        return {
            totalSeats: location.totalSeats,
            occupiedSeats,
            vacantSeats: Math.max(0, vacantSeats),
            occupancyPercentage: Math.min(100, occupancyPercentage),
            tenantCount: activeTenants.length,
            totalRent: activeTenants.reduce((sum, t) => sum + t.rent, 0),
        };
    };

    // Calculate global KPIs across all locations
    const calculateGlobalKPIs = () => {
        let totalSeats = 0;
        let occupiedSeats = 0;
        let totalTenants = 0;
        let totalRent = 0;

        locations.forEach((loc) => {
            const kpis = calculateLocationKPIs(loc.id);
            if (kpis) {
                totalSeats += kpis.totalSeats;
                occupiedSeats += kpis.occupiedSeats;
                totalTenants += kpis.tenantCount;
                totalRent += kpis.totalRent;
            }
        });

        return {
            totalSeats,
            occupiedSeats,
            vacantSeats: totalSeats - occupiedSeats,
            occupancyPercentage: Math.round((occupiedSeats / totalSeats) * 100),
            totalTenants,
            totalRent,
            totalLocations: locations.length,
        };
    };

    // Get attendance stats for a location and date
    const getAttendanceStats = (locationId, date) => {
        const locationAttendance = getAttendanceByLocationAndDate(locationId, date);
        const present = locationAttendance.filter((a) => a.status === 'Present').length;
        const absent = locationAttendance.filter((a) => a.status === 'Absent').length;
        const total = locationAttendance.length;

        return { present, absent, total };
    };

    const value = {
        // Data
        tenants,
        staff,
        attendance,
        bookings,
        // Tenant operations
        addTenant,
        updateTenant,
        deleteTenant,
        getTenantsByLocation,
        getActiveTenantsByLocation,
        // Staff operations
        getStaffByLocation,
        // Attendance operations
        updateAttendance,
        getAttendanceByDate,
        getAttendanceByLocationAndDate,
        getAttendanceStats,
        // Booking operations
        getBookingsByLocation,
        // KPI calculations
        calculateLocationKPIs,
        calculateGlobalKPIs,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
