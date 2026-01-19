import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { IconArmchair2, IconCheck, IconStarFilled, IconInfoCircle } from '@tabler/icons-react';

/**
 * Selectable seat grid for booking dialog
 */
export function SelectableSeatGrid({ capacity, selectedSeats = [], onSeatToggle, bookedSeats = [], seatsMetadata = [] }) {
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
                    const metadata = seatsMetadata.find(m => m.id === index) || { type: 'Standard', labels: [] };
                    const isPremium = metadata.type === 'Premium';

                    return (
                        <div key={index} className="relative group">
                            <motion.button
                                whileHover={!isBooked && !isDirector ? { scale: 1.1 } : {}}
                                whileTap={!isBooked && !isDirector ? { scale: 0.95 } : {}}
                                onClick={() => !isBooked && !isDirector && onSeatToggle(index)}
                                disabled={isBooked || isDirector}
                                className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition-all shadow-sm relative',
                                    isBooked
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border-0"
                                        : isDirector
                                            ? isSelected
                                                ? "bg-blue-600 text-white border-0 cursor-default"
                                                : "bg-white text-slate-600 border border-slate-200 cursor-default shadow-none"
                                            : isSelected
                                                ? "bg-blue-600 text-white border-0 shadow-lg shadow-blue-200"
                                                : cn(
                                                    "bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600",
                                                    isPremium && "border-amber-300 bg-amber-50/30 shadow-inner"
                                                )
                                )}
                            >
                                {isPremium && !isBooked && !isSelected && (
                                    <IconStarFilled size={8} className="absolute top-0.5 right-0.5 text-amber-500" />
                                )}

                                {isSelected ? (
                                    <IconCheck size={18} strokeWidth={3} />
                                ) : (
                                    index + 1
                                )}
                            </motion.button>

                            {/* Metadata Tooltip */}
                            {((metadata.labels.length > 0 || isPremium) && (!isBooked || isDirector)) && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-[9px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-2xl border border-white/10 flex flex-col items-center">
                                    {isPremium && (
                                        <span className="text-amber-400 font-bold uppercase tracking-tighter mb-0.5 flex items-center gap-1">
                                            <IconStarFilled size={8} />
                                            Premium
                                        </span>
                                    )}
                                    {metadata.labels.length > 0 && (
                                        <span className="font-medium text-slate-200">
                                            {metadata.labels.join(' • ')}
                                        </span>
                                    )}
                                    {isBooked && (
                                        <span className="text-[8px] text-red-300 font-bold uppercase mt-0.5">Booked</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 mt-2 max-w-md">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-white border border-slate-200" />
                    <span>Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-50 border border-amber-300 relative">
                        <IconStarFilled size={6} className="absolute -top-1 -right-1 text-amber-500" />
                    </div>
                    <span>Premium (+20%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-600" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-200" />
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
