import { Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * Theatre-style selectable seat grid for ITS Bay rooms
 * STRICT CSS GRID: 5 columns, fixed 44px cells, perfect alignment
 */
export function SelectableSeatGrid({
    capacity,
    selectedSeats = [],
    onSeatToggle,
    bookedSeats = []
}) {
    const COLS = 5;
    const CELL_SIZE = 44; // Fixed cell size in pixels
    const GAP = 8; // Gap between cells
    const gridWidth = COLS * CELL_SIZE + (COLS - 1) * GAP;

    const seats = Array.from({ length: capacity }, (_, i) => i);

    const getSeatState = (seatIndex) => {
        if (bookedSeats.includes(seatIndex)) return 'unavailable';
        if (selectedSeats.includes(seatIndex)) return 'selected';
        return 'available';
    };

    const handleSeatClick = (seatIndex) => {
        if (bookedSeats.includes(seatIndex)) return;
        onSeatToggle(seatIndex);
    };

    return (
        <div className="flex flex-col items-center">
            {/* FRONT label - centered, same width as grid */}
            <div
                className="py-2 mb-4 bg-neutral-700/60 rounded-md text-center text-[11px] text-neutral-300 uppercase tracking-widest font-medium"
                style={{ width: gridWidth }}
            >
                Front
            </div>

            {/* Seat Grid - STRICT CSS GRID */}
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                    gap: `${GAP}px`,
                    width: gridWidth
                }}
            >
                {seats.map((seatIndex) => {
                    const state = getSeatState(seatIndex);
                    return (
                        <motion.button
                            key={seatIndex}
                            whileHover={state !== 'unavailable' ? { scale: 1.08 } : {}}
                            whileTap={state !== 'unavailable' ? { scale: 0.95 } : {}}
                            onClick={() => handleSeatClick(seatIndex)}
                            disabled={state === 'unavailable'}
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                            className={cn(
                                "flex flex-col items-center justify-center rounded-md border-2 transition-all duration-150",
                                state === 'available' && "bg-neutral-800 border-neutral-600 hover:border-blue-400 hover:bg-blue-900/40 cursor-pointer",
                                state === 'selected' && "bg-blue-600 border-blue-400 text-white cursor-pointer shadow-lg shadow-blue-500/40",
                                state === 'unavailable' && "bg-red-900/40 border-red-700/50 cursor-not-allowed"
                            )}
                        >
                            <Armchair
                                className={cn(
                                    "w-5 h-5",
                                    state === 'available' && "text-neutral-400",
                                    state === 'selected' && "text-white",
                                    state === 'unavailable' && "text-red-400/60"
                                )}
                            />
                            <span className={cn(
                                "text-[9px] font-medium mt-0.5",
                                state === 'available' && "text-neutral-500",
                                state === 'selected' && "text-white",
                                state === 'unavailable' && "text-red-400/60"
                            )}>
                                {seatIndex + 1}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend - centered below grid */}
            <div
                className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-700"
                style={{ width: gridWidth }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-neutral-800 border-2 border-neutral-600"></div>
                    <span className="text-xs text-neutral-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-600 border-2 border-blue-400"></div>
                    <span className="text-xs text-neutral-400">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-900/40 border-2 border-red-700/50"></div>
                    <span className="text-xs text-neutral-400">Booked</span>
                </div>
            </div>
        </div>
    );
}
