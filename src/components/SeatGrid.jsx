import { cn } from '@/lib/utils';
import { IconArmchair2, IconStarFilled } from '@tabler/icons-react';

/**
 * Visual-only seat grid for room preview
 */
export function SeatGrid({ capacity, seatsMetadata = [] }) {
    // Calculate grid dimensions - aim for roughly square layout
    const cols = capacity <= 4 ? 2 : capacity <= 6 ? 3 : capacity <= 9 ? 3 : capacity <= 12 ? 4 : 5;

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Grid of seats - Structured as an office layout */}
            <div
                className="grid gap-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: capacity }).map((_, index) => {
                    const metadata = seatsMetadata.find(m => m.id === index) || { type: 'Standard' };
                    const isPremium = metadata.type === 'Premium';

                    return (
                        <div
                            key={index}
                            className={cn(
                                'w-8 h-8 rounded-md flex items-center justify-center relative',
                                isPremium
                                    ? "bg-amber-50 border border-amber-200 text-amber-600 shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-400",
                                'transition-all duration-200'
                            )}
                        >
                            <IconArmchair2 size={14} className={cn(isPremium ? "text-amber-500" : "text-slate-300")} />
                            {isPremium && (
                                <IconStarFilled size={6} className="absolute -top-1 -right-1 text-amber-500" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Simple Legend for Seat Types */}
            {seatsMetadata.length > 0 && (
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-sm bg-white border border-slate-200" />
                        <span>Std</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-sm bg-amber-50 border border-amber-200" />
                        <span>Prem</span>
                    </div>
                </div>
            )}
        </div>
    );
}
