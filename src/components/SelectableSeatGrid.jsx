import { cn } from '@/lib/utils';
import { IconArmchair2, IconCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

/**
 * Selectable seat grid for booking dialog
 */
export function SelectableSeatGrid({ capacity, selectedSeats = [], onSeatToggle, bookedSeats = [] }) {
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
                        <Button
                            key={index}
                            variant={isSelected ? "default" : "outline"}
                            size="icon-sm"
                            onClick={() => !isBooked && onSeatToggle(index)}
                            disabled={isBooked}
                            className={cn(
                                'w-10 h-10 rounded-lg',
                                isBooked && 'opacity-50 grayscale',
                                !isBooked && !isSelected && 'border-blue-100 bg-blue-50/30 text-blue-400 hover:border-blue-300 hover:bg-blue-100/50',
                                isSelected && 'scale-[1.05] shadow-lg shadow-primary/20'
                            )}
                        >
                            {isSelected ? (
                                <IconCheck size={18} strokeWidth={3} />
                            ) : (
                                <IconArmchair2 size={18} />
                            )}
                        </Button>
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
