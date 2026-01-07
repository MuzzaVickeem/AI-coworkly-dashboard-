import { cn } from '@/lib/utils';
import { IconArmchair2 } from '@tabler/icons-react';

/**
 * Visual-only seat grid for room preview
 */
export function SeatGrid({ capacity }) {
    // Calculate grid dimensions - aim for roughly square layout
    const cols = capacity <= 4 ? 2 : capacity <= 6 ? 3 : capacity <= 9 ? 3 : capacity <= 12 ? 4 : 5;
    const rows = Math.ceil(capacity / cols);

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Grid of seats */}
            <div
                className="grid gap-2"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: capacity }).map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            'bg-slate-100 border border-slate-200 text-slate-400',
                            'transition-all duration-200'
                        )}
                    >
                        <IconArmchair2 size={18} />
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                    <span>Available</span>
                </div>
            </div>
        </div>
    );
}
