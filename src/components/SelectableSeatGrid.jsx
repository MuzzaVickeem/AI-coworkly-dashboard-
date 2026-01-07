import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { IconArmchair2, IconCheck } from '@tabler/icons-react';

/**
 * Selectable seat grid for booking dialog
 */
export function SelectableSeatGrid({ capacity, selectedSeats = [], onSeatToggle, bookedSeats = [] }) {
    const { isDirector } = useAuth();
    // Calculate grid dimensions - aim for roughly square layout
    const cols = capacity <= 4 ? 2 : capacity <= 6 ? 3 : capacity <= 9 ? 3 : capacity <= 12 ? 4 : 5;

    const isSeatBooked = (index) => bookedSeats.includes(index);
    const isSeatSelected = (index) => selectedSeats.includes(index);

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Grid of seats */}
            <div
                className="grid gap-2"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: capacity }).map((_, index) => {
                    const isBooked = isSeatBooked(index);
                    const isSelected = isSeatSelected(index);

                    return (
                        <motion.button // Changed to motion.button
                            key={index}
                            whileHover={!isBooked && !isDirector ? { scale: 1.1 } : {}} // Added isDirector condition
                            whileTap={!isBooked && !isDirector ? { scale: 0.95 } : {}} // Added isDirector condition
                            // variant={isSelected ? "default" : "outline"} // Removed variant prop
                            // size="icon-sm" // Removed size prop
                            onClick={() => !isBooked && !isDirector && onSeatToggle(index)} // Added isDirector condition
                            disabled={isBooked || isDirector} // Added isDirector condition
                            className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition-all shadow-sm', // Modified base classes
                                isBooked
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed border-0" // Booked style
                                    : isDirector // Director specific styles
                                        ? isSelected
                                            ? "bg-blue-600 text-white border-0 cursor-default"
                                            : "bg-white text-slate-600 border border-slate-200 cursor-default shadow-none"
                                        : isSelected // User specific styles
                                            ? "bg-blue-600 text-white border-0 shadow-lg shadow-blue-200"
                                            : "bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600"
                            )}
                        >
                            {/* Original icon logic, but now with seat number */}
                            {isSelected ? (
                                <IconCheck size={18} strokeWidth={3} />
                            ) : (
                                // <IconArmchair2 size={18} /> // Removed original icon
                                index + 1 // Display seat number
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-50/50 border border-blue-100" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-100 border border-slate-500" />
                    <span>Booked</span>
                </div>
            </div>

            {/* Selection count */}
            {selectedSeats.length > 0 && (
                <div className="text-sm font-medium text-blue-600">
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
}
