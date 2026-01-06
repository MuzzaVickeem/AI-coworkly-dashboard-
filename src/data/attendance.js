// Mock attendance data for staff
// Generate attendance for the past 7 days

const generateAttendanceForDate = (date, staff) => {
    return staff.map((s) => {
        const isPresent = Math.random() > 0.15; // 85% attendance rate
        const timeIn = isPresent
            ? `${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
            : null;
        const timeOut = isPresent
            ? `${17 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
            : null;

        return {
            id: `att-${s.id}-${date}`,
            staffId: s.id,
            date: date,
            status: isPresent ? 'Present' : 'Absent',
            timeIn,
            timeOut,
        };
    });
};

// Get dates for the past 7 days
const getDatesArray = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
};

// Import staff for generation
import { initialStaff } from './staff';

export const generateInitialAttendance = () => {
    const dates = getDatesArray();
    let allAttendance = [];

    dates.forEach((date) => {
        const dayAttendance = generateAttendanceForDate(date, initialStaff);
        allAttendance = [...allAttendance, ...dayAttendance];
    });

    return allAttendance;
};

export const initialAttendance = generateInitialAttendance();
