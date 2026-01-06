import { useState, useRef } from 'react';
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
import { useData } from '@/context/DataContext';
import { useLocation } from '@/context/LocationContext';
import { IconArrowLeft, IconUpload } from '@tabler/icons-react';

const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
    const { selectedLocationId } = useLocation();
    const { getTenantsByLocation } = useData();
    const existingTenants = getTenantsByLocation(selectedLocationId);
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('new');
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [fileName, setFileName] = useState('');

    // Form state for new tenant
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        phone: '',
        email: '',
    });

    const selectedExistingTenant = existingTenants.find(t => t.id === selectedTenantId);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const handleConfirm = () => {
        if (activeTab === 'new') {
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
            onConfirm({
                type: 'existing',
                tenantId: selectedTenantId,
                tenantName: selectedExistingTenant?.name,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                seatsBooked: bookingData.seats,
                amount: bookingData.amount,
            });
        }
    };

    const canConfirmNew = formData.companyName && formData.phone;
    const canConfirmExisting = selectedTenantId;
    const canConfirm = activeTab === 'new' ? canConfirmNew : canConfirmExisting;

    if (!bookingData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="bg-neutral-900 border-neutral-800 text-white p-0 overflow-hidden"
                style={{ maxWidth: '640px', width: '95vw' }}
            >
                {/* Header with Back Button */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                            onClick={onBack}
                        >
                            <IconArrowLeft size={18} />
                        </Button>
                        <div>
                            <DialogTitle className="text-xl font-bold">Assign Tenant</DialogTitle>
                            <DialogDescription className="text-neutral-400 text-sm">
                                Assign a tenant to complete the booking for {bookingData.roomName}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Tabs with WHITE text */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-neutral-800 mb-6 p-1">
                            <TabsTrigger
                                value="new"
                                className="text-neutral-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-neutral-300"
                            >
                                New Tenant
                            </TabsTrigger>
                            <TabsTrigger
                                value="existing"
                                className="text-neutral-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-neutral-300"
                            >
                                Existing Tenant
                            </TabsTrigger>
                        </TabsList>

                        {/* Booking Summary with Start & End Date */}
                        <div className="bg-neutral-800/50 rounded-lg border border-neutral-700 p-4 mb-6">
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Booking Details (Read-Only)</h4>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Room</span>
                                    <span className="text-white font-medium">{bookingData.roomName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Seats Booked</span>
                                    <span className="text-white font-medium">{bookingData.seats}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Start Date</span>
                                    <span className="text-white font-medium">{formatDateDisplay(bookingData.startDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">End Date</span>
                                    <span className="text-white font-medium">{formatDateDisplay(bookingData.endDate)}</span>
                                </div>
                                <div className="flex justify-between col-span-2 pt-2 border-t border-neutral-700 mt-2">
                                    <span className="text-neutral-400 font-medium">Amount</span>
                                    <span className="text-green-400 font-bold text-lg">{formatPrice(bookingData.amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* New Tenant Tab */}
                        <TabsContent value="new" className="space-y-4 mt-0">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-neutral-300">Company Name *</Label>
                                    <Input
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="bg-neutral-800 border-neutral-700 text-white"
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-neutral-300">Contact Person</Label>
                                        <Input
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                            className="bg-neutral-800 border-neutral-700 text-white"
                                            placeholder="Contact name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-neutral-300">Phone *</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-neutral-800 border-neutral-700 text-white"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-neutral-300">Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-neutral-800 border-neutral-700 text-white"
                                        placeholder="email@company.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-neutral-300">Agreement Document</Label>
                                    <div
                                        className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 cursor-pointer hover:border-neutral-600"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <IconUpload size={18} className="text-neutral-400" />
                                        <span className="text-neutral-300 text-sm flex-1">
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
                                    <span className="text-xs text-neutral-500">Accepted formats: PDF, JPG, PNG</span>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Existing Tenant Tab */}
                        <TabsContent value="existing" className="space-y-4 mt-0">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-neutral-300">Select Company *</Label>
                                    <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                            <SelectValue placeholder="Choose existing tenant" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-800 border-neutral-700">
                                            {existingTenants.map((tenant) => (
                                                <SelectItem
                                                    key={tenant.id}
                                                    value={tenant.id}
                                                    className="text-white hover:bg-neutral-700 focus:bg-neutral-700"
                                                >
                                                    {tenant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedExistingTenant && (
                                    <div className="bg-neutral-800/30 rounded-lg border border-neutral-700 p-4 space-y-3">
                                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tenant Details (Read-Only)</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-neutral-500 text-xs">Company</span>
                                                <p className="text-white font-medium">{selectedExistingTenant.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-500 text-xs">Phone</span>
                                                <p className="text-white font-medium">{selectedExistingTenant.contact?.phone}</p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-500 text-xs">Email</span>
                                                <p className="text-white font-medium">{selectedExistingTenant.contact?.email}</p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-500 text-xs">Status</span>
                                                <p className="text-green-400 font-medium">{selectedExistingTenant.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Footer Actions */}
                    <div className="flex justify-between gap-4 mt-6 pt-6 border-t border-neutral-800">
                        <Button
                            variant="outline"
                            className="h-11 px-6 border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                            onClick={onBack}
                        >
                            ← Back
                        </Button>
                        <Button
                            className="h-11 px-8 bg-green-600 hover:bg-green-500 text-white font-semibold"
                            disabled={!canConfirm}
                            onClick={handleConfirm}
                        >
                            Confirm & Book
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
