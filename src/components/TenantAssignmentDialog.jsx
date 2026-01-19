import { useState, useRef, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { IconArrowLeft, IconUpload, IconBuilding } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const formatPrice = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTimeDisplay = (time24) => {
    if (!time24) return '—';
    const [hour, min] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${hour12}:${min.toString().padStart(2, '0')} ${period}`;
};

const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
};

const calculateHoursBetween = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return (endMinutes - startMinutes) / 60;
};

/**
 * TenantAssignmentDialog - Unified booking → tenant assignment
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onBack: () => void (navigate back to booking dialog)
 * - bookingData: { roomName, seats, amount, startDate, endDate, roomId }
 * - onConfirm: (tenantData) => void
 */
export function TenantAssignmentDialog({ isOpen, onClose, onBack, bookingData, onConfirm }) {
    const { isDirector } = useAuth();
    const { getUniqueVendors } = useBooking();

    // Get ALL existing vendors from completed bookings (not location-scoped for reuse)
    const existingVendors = getUniqueVendors;
    const hasExistingVendors = existingVendors.length > 0;

    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('new');
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [fileName, setFileName] = useState('');

    // Form state for new tenant
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        phone: '',
        email: '',
    });

    // Find selected vendor
    const selectedVendor = useMemo(() => {
        return existingVendors.find(v => v.companyId === selectedVendorId);
    }, [existingVendors, selectedVendorId]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const handleConfirm = () => {
        if (activeTab === 'new') {
            // Create NEW vendor
            onConfirm({
                type: 'new',
                companyName: formData.companyName,
                contactName: formData.contactName,
                phone: formData.phone,
                email: formData.email,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                seatsBooked: bookingData.seats,
                amount: bookingData.amount,
                agreementFile: fileName,
            });
        } else {
            // Use EXISTING vendor - pass companyId to prevent duplication
            onConfirm({
                type: 'existing',
                companyId: selectedVendor?.companyId,
                companyName: selectedVendor?.companyName,
                phone: selectedVendor?.contact?.phone,
                email: selectedVendor?.contact?.email,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                seatsBooked: bookingData.seats,
                amount: bookingData.amount,
                agreementFile: fileName,
            });
        }
    };

    const canConfirmNew = formData.companyName && formData.phone;
    const canConfirmExisting = selectedVendorId;
    const canConfirm = activeTab === 'new' ? canConfirmNew : canConfirmExisting;

    if (!bookingData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl"
                style={{ maxWidth: '640px', width: '95vw' }}
            >
                {/* Header with Back Button */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onBack}
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">Assign Tenant</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm">
                                Assign a tenant to complete the booking for {bookingData.roomName}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-100 mb-6 p-1">
                            <TabsTrigger
                                value="new"
                                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-600"
                                disabled={isDirector}
                            >
                                New Tenant
                            </TabsTrigger>
                            <TabsTrigger
                                value="existing"
                                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-600"
                                disabled={!hasExistingVendors || isDirector}
                            >
                                Existing Tenant {!hasExistingVendors && '(None)'}
                            </TabsTrigger>
                        </TabsList>

                        {/* Booking Summary with Start & End Date */}
                        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Booking Details (Read-Only)</h4>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Room</span>
                                    <span className="text-slate-900 font-medium">{bookingData.roomName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Booking Type</span>
                                    <span className={cn(
                                        "font-medium px-2 py-0.5 rounded text-xs",
                                        bookingData.bookingType === 'time-based'
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {bookingData.bookingType === 'time-based' ? 'Hourly' : 'Day-Based'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">{bookingData.dates?.length > 1 ? 'Date Range' : 'Date'}</span>
                                    <span className="text-slate-900 font-medium">
                                        {bookingData.dates?.length > 1
                                            ? `${formatDateDisplay(bookingData.startDate)} – ${formatDateDisplay(bookingData.endDate)}`
                                            : formatDateDisplay(bookingData.startDate)
                                        }
                                    </span>
                                </div>
                                {bookingData.bookingType === 'time-based' && bookingData.startTime && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Time</span>
                                        <span className="text-slate-900 font-medium">
                                            {formatTimeDisplay(bookingData.startTime)} – {formatTimeDisplay(bookingData.endTime)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        {bookingData.bookingType === 'time-based' ? 'Total Hours' : 'Total Days'}
                                    </span>
                                    <span className="text-slate-900 font-medium">
                                        {bookingData.bookingType === 'time-based'
                                            ? `${bookingData.totalHours || calculateHoursBetween(bookingData.startTime, bookingData.endTime)} hr${(bookingData.totalHours || 1) > 1 ? 's' : ''}`
                                            : `${calculateDays(bookingData.startDate, bookingData.endDate)} day${calculateDays(bookingData.startDate, bookingData.endDate) > 1 ? 's' : ''}`
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Selected Seats</span>
                                    <span className="text-slate-900 font-medium">
                                        {bookingData.selectedSeats?.length > 0
                                            ? bookingData.selectedSeats.map(s => s + 1).join(', ')
                                            : bookingData.seats + ' seats (all)'}
                                    </span>
                                </div>
                                <div className="flex justify-between col-span-2 pt-2 border-t border-slate-200 mt-2">
                                    <span className="text-slate-500 font-medium">Amount</span>
                                    <span className="text-emerald-600 font-bold text-lg">{formatPrice(bookingData.amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* New Tenant Tab */}
                        <TabsContent value="new" className="space-y-4 mt-0">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-slate-700">Company Name *</Label>
                                    <Input
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-slate-700">Contact Person</Label>
                                        <Input
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                            className="bg-white border-slate-300 text-slate-900"
                                            placeholder="Contact name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-slate-700">Phone *</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-white border-slate-300 text-slate-900"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-700">Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-white border-slate-300 text-slate-900"
                                        placeholder="email@company.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-700">Agreement Document</Label>
                                    <div
                                        className="flex items-center gap-3 bg-white border border-slate-300 rounded-md px-3 py-2 cursor-pointer hover:border-blue-400 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <IconUpload size={18} className="text-slate-400" />
                                        <span className="text-slate-600 text-sm flex-1">
                                            {fileName || 'Click to upload file'}
                                        </span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400">Accepted formats: PDF, JPG, PNG</span>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Existing Tenant Tab */}
                        <TabsContent value="existing" className="space-y-4 mt-0">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-slate-700">Select Company *</Label>
                                    <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                                        <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                                            <SelectValue placeholder="Choose existing vendor" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200">
                                            {existingVendors.map((vendor) => (
                                                <SelectItem
                                                    key={vendor.companyId}
                                                    value={vendor.companyId}
                                                    className="text-slate-900"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <IconBuilding size={14} className="text-blue-600" />
                                                        {vendor.companyName}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedVendor && (
                                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendor Details (Auto-Populated)</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-slate-400 text-xs">Company</span>
                                                <p className="text-slate-900 font-medium">{selectedVendor.companyName}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs">Company ID</span>
                                                <p className="text-blue-600 font-mono text-sm">{selectedVendor.companyId}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs">Phone</span>
                                                <p className="text-slate-900 font-medium">{selectedVendor.contact?.phone || '—'}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs">Email</span>
                                                <p className="text-slate-900 font-medium">{selectedVendor.contact?.email || '—'}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs">Previous Bookings</span>
                                                <p className="text-emerald-600 font-semibold">{selectedVendor.totalBookings}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs">Total Spent</span>
                                                <p className="text-emerald-600 font-semibold">{formatPrice(selectedVendor.totalAmount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Optional: Agreement document for this booking */}
                                <div className="grid gap-2">
                                    <Label className="text-slate-700">Agreement Document (Optional)</Label>
                                    <div
                                        className="flex items-center gap-3 bg-white border border-slate-300 rounded-md px-3 py-2 cursor-pointer hover:border-blue-400 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <IconUpload size={18} className="text-slate-400" />
                                        <span className="text-slate-600 text-sm flex-1">
                                            {fileName || 'Click to upload file'}
                                        </span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Footer Actions */}
                    <div className="flex justify-between gap-4 mt-6 pt-6 border-t border-slate-200">
                        <Button
                            variant="outline"
                            className="h-11 px-6"
                            onClick={onBack}
                        >
                            ← Back
                        </Button>
                        {!isDirector && (
                            <Button
                                className="h-11 px-8 font-semibold"
                                disabled={!canConfirm}
                                onClick={handleConfirm}
                            >
                                Confirm & Book
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
