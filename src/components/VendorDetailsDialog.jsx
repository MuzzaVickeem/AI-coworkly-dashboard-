import { useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
    IconBuilding,
    IconPhone,
    IconMail,
    IconCalendar,
    IconCurrencyRupee,
    IconFile,
    IconMapPin,
    IconArmchair2,
    IconClipboardList,
} from '@tabler/icons-react';
import { useBooking } from '@/context/BookingContext';

const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * VendorDetailsDialog - Shows vendor summary and accordion booking history
 */
export function VendorDetailsDialog({ isOpen, onClose, vendor }) {
    const { getVendorBookings } = useBooking();

    const vendorBookings = useMemo(() => {
        if (!vendor?.companyId) return [];
        return getVendorBookings(vendor.companyId);
    }, [vendor?.companyId, getVendorBookings]);

    if (!vendor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl flex flex-col"
                style={{ maxWidth: '720px', width: '95vw', maxHeight: '85vh' }}
            >
                {/* Fixed Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <IconBuilding size={22} className="text-blue-600" />
                        Vendor Details — {vendor.companyName}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Complete booking history and vendor information
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Vendor Summary Section */}
                    <div className="p-6 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Vendor Summary
                        </h4>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Left column - Company info */}
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-slate-400">Company Name</span>
                                    <p className="text-base font-semibold text-slate-900">{vendor.companyName}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400">Company ID</span>
                                    <p className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                        {vendor.companyId}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block mb-1">Contact Details</span>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <IconPhone size={14} className="text-slate-400" />
                                            {vendor.contact?.phone || '—'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <IconMail size={14} className="text-slate-400" />
                                            {vendor.contact?.email || '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <span className="text-xs text-slate-400">Total Bookings</span>
                                    <p className="text-2xl font-bold text-slate-900">{vendor.totalBookings}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                    <span className="text-xs text-emerald-600">Active Bookings</span>
                                    <p className="text-2xl font-bold text-emerald-600">{vendor.activeBookings}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 col-span-2">
                                    <span className="text-xs text-blue-600">Total Amount</span>
                                    <p className="text-2xl font-bold text-blue-600">{formatPrice(vendor.totalAmount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking History Section */}
                    <div className="p-6 pb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <IconClipboardList size={16} className="text-slate-400" />
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Booking History ({vendorBookings.length})
                            </h4>
                        </div>

                        {vendorBookings.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                No bookings found for this vendor.
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="space-y-3">
                                {vendorBookings.map((booking, index) => (
                                    <AccordionItem
                                        key={booking.id}
                                        value={booking.id}
                                        className="border border-slate-200 rounded-lg overflow-hidden bg-white data-[state=open]:shadow-md transition-shadow"
                                    >
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 [&[data-state=open]]:bg-slate-50">
                                            <div className="flex items-center justify-between w-full pr-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-semibold text-slate-900 text-left">
                                                            {booking.roomName}
                                                        </span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <IconMapPin size={12} />
                                                            {booking.locationName}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400">
                                                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                                                    </span>
                                                    <Badge
                                                        className={
                                                            booking.status === 'Active'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                        }
                                                    >
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 pt-2 border-t border-slate-100">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-xs text-slate-400">Room / Bay Name</span>
                                                        <p className="text-slate-900 font-medium">{booking.roomName}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-400">Location</span>
                                                        <p className="text-slate-900">{booking.locationName}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-400">Seats Booked</span>
                                                        <p className="text-slate-900 flex items-center gap-1">
                                                            <IconArmchair2 size={14} className="text-slate-400" />
                                                            {booking.seats} seat{booking.seats !== 1 ? 's' : ''}
                                                            {booking.selectedSeats?.length > 0 && (
                                                                <span className="text-slate-400 text-xs ml-1">
                                                                    (#{booking.selectedSeats.map(s => s + 1).join(', #')})
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-xs text-slate-400">Booking Period</span>
                                                        <p className="text-slate-900 flex items-center gap-1">
                                                            <IconCalendar size={14} className="text-slate-400" />
                                                            {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-400">Amount</span>
                                                        <p className="text-emerald-600 font-bold flex items-center gap-1">
                                                            <IconCurrencyRupee size={14} />
                                                            {formatPrice(booking.amount).replace('₹', '')}
                                                        </p>
                                                    </div>
                                                    {booking.agreementFile && (
                                                        <div>
                                                            <span className="text-xs text-slate-400">Agreement Document</span>
                                                            <p className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
                                                                <IconFile size={14} />
                                                                {booking.agreementFile}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}

                        {/* Bottom spacer to ensure last accordion is scrollable */}
                        <div className="h-4" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
