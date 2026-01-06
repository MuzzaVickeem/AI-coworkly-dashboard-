import { Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Visual-only seat grid for non-seat-select rooms
 * STRICT CSS GRID: Matches SelectableSeatGrid dimensions exactly
 */
export function SeatGrid({ capacity }) {
    const COLS = 5;
    const CELL_SIZE = 44;
    const GAP = 8;
    const gridWidth = COLS * CELL_SIZE + (COLS - 1) * GAP;

    const seats = Array.from({ length: capacity }, (_, i) => i);

    return (
        <div className="flex flex-col items-center">
            {/* FRONT label - centered, same width as grid */}
            <div
                className="py-2 mb-4 bg-neutral-700/60 rounded-md text-center text-[11px] text-neutral-300 uppercase tracking-widest font-medium"
                style={{ width: gridWidth }}
            >
                Front
            </div>

            {/* Seat Grid - STRICT CSS GRID (visual only) */}
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                    gap: `${GAP}px`,
                    width: gridWidth
                }}
            >
                {seats.map((seatIndex) => (
                    <div
                        key={seatIndex}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        className="flex flex-col items-center justify-center rounded-md border-2 bg-neutral-800 border-neutral-600"
                    >
                        <Armchair className="w-5 h-5 text-neutral-400" />
                        <span className="text-[9px] font-medium mt-0.5 text-neutral-500">
                            {seatIndex + 1}
                        </span>
                    </div>
                ))}
            </div>

            {/* Info text */}
            <p className="text-xs text-neutral-500 mt-4 pt-4 border-t border-neutral-700 text-center" style={{ width: gridWidth }}>
                Full room booking • All {capacity} seats included
            </p>
        </div>
    );
}
