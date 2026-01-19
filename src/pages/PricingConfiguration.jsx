import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    IconCurrencyRupee,
    IconCalendarEvent,
    IconClock,
    IconDeviceFloppy,
    IconHistory,
    IconArmchair,
    IconDoorEnter,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { usePricing } from '@/context/PricingContext';
import { useBooking } from '@/context/BookingContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { locations } from '@/data/locations';

const formatPrice = (amount) => `₹${amount?.toLocaleString('en-IN') || 0} `;

const formatDateShort = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

export function PricingConfiguration() {
    const { isAdmin } = useAuth();
    const { selectedLocationId } = useLocation();
    const { getRoomsByLocation } = useBooking();
    const { getRoomPricing, updateRoomPricing, pricingHistory } = usePricing();

    const [selectedLocation, setSelectedLocation] = useState(selectedLocationId || 'loc-a');
    const [selectedRoom, setSelectedRoom] = useState('');

    // Explicit pricing states
    const [seatPricePerHour, setSeatPricePerHour] = useState('');
    const [seatPricePerDay, setSeatPricePerDay] = useState('');
    const [seatPricePerWeek, setSeatPricePerWeek] = useState('');
    const [roomPricePerHour, setRoomPricePerHour] = useState('');
    const [roomPricePerDay, setRoomPricePerDay] = useState('');
    const [roomPricePerWeek, setRoomPricePerWeek] = useState('');

    const [effectiveFrom, setEffectiveFrom] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [isSaving, setIsSaving] = useState(false);

    const rooms = useMemo(() => {
        return getRoomsByLocation(selectedLocation);
    }, [selectedLocation, getRoomsByLocation]);

    const selectedRoomData = useMemo(() => {
        return rooms.find(r => r.id === selectedRoom);
    }, [rooms, selectedRoom]);

    const currentPricing = useMemo(() => {
        if (!selectedRoom) return null;
        return getRoomPricing(selectedLocation, selectedRoom);
    }, [selectedLocation, selectedRoom, getRoomPricing]);

    // Load current pricing when room is selected
    const handleRoomChange = (roomId) => {
        setSelectedRoom(roomId);
        const pricing = getRoomPricing(selectedLocation, roomId);
        if (pricing) {
            setSeatPricePerHour(pricing.seatPricePerHour?.toString() || '');
            setSeatPricePerDay(pricing.seatPricePerDay?.toString() || '');
            setSeatPricePerWeek(pricing.seatPricePerWeek?.toString() || '');
            setRoomPricePerHour(pricing.roomPricePerHour?.toString() || '');
            setRoomPricePerDay(pricing.roomPricePerDay?.toString() || '');
            setRoomPricePerWeek(pricing.roomPricePerWeek?.toString() || '');
        } else {
            setSeatPricePerHour('');
            setSeatPricePerDay('');
            setSeatPricePerWeek('');
            setRoomPricePerHour('');
            setRoomPricePerDay('');
            setRoomPricePerWeek('');
        }
    };

    // Reset room selection when location changes
    const handleLocationChange = (locationId) => {
        setSelectedLocation(locationId);
        setSelectedRoom('');
        setSeatPricePerHour('');
        setSeatPricePerDay('');
        setRoomPricePerHour('');
        setRoomPricePerDay('');
    };

    const handleSave = async () => {
        if (!selectedRoom) {
            toast.error('Please select a room');
            return;
        }

        const sPerHour = parseFloat(seatPricePerHour) || 0;
        const sPerDay = parseFloat(seatPricePerDay) || 0;
        const sPerWeek = parseFloat(seatPricePerWeek) || 0;
        const rPerHour = parseFloat(roomPricePerHour) || 0;
        const rPerDay = parseFloat(roomPricePerDay) || 0;
        const rPerWeek = parseFloat(roomPricePerWeek) || 0;

        // Validation: At least hourly or daily must be set for Room
        if (rPerHour <= 0 && rPerDay <= 0) {
            toast.error('Please enter at least one valid room price (Hourly or Daily)');
            return;
        }

        // If seat selection allowed, at least one seat price must be set
        if (selectedRoomData?.allowSeatSelection && sPerHour <= 0 && sPerDay <= 0) {
            toast.error('Please enter at least one valid seat price (Hourly or Daily)');
            return;
        }

        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = updateRoomPricing(selectedLocation, selectedRoom, {
            seatPricePerHour: sPerHour,
            seatPricePerDay: sPerDay,
            seatPricePerWeek: sPerWeek,
            roomPricePerHour: rPerHour,
            roomPricePerDay: rPerDay,
            roomPricePerWeek: rPerWeek,
            effectiveFrom,
        });

        setIsSaving(false);

        if (result.success) {
            toast.success('Pricing updated successfully', {
                description: `New pricing will be effective from ${formatDateShort(effectiveFrom)} `,
            });
        } else {
            toast.error('Failed to update pricing', {
                description: result.error,
            });
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-slate-900">Pricing Configuration</h1>
                <p className="text-slate-500 mt-1">Standardized pricing: Seat vs Room / Hourly vs Daily</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Form */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <IconCurrencyRupee size={20} className="text-emerald-600" />
                                Configure Room Rates
                            </CardTitle>
                            <CardDescription>Select a location and room to set explicit prices.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Select value={selectedLocation} onValueChange={handleLocationChange}>
                                        <SelectTrigger className="bg-white border-slate-300">
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map(loc => (
                                                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Room</Label>
                                    <Select value={selectedRoom} onValueChange={handleRoomChange}>
                                        <SelectTrigger className="bg-white border-slate-300">
                                            <SelectValue placeholder="Select room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rooms.map(room => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    {room.name} ({room.capacity} {room.allowSeatSelection ? 'seats' : 'cap'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedRoom && (
                                <div className="space-y-8 pt-4 border-t border-slate-100">
                                    {/* SEAT PRICING (Optional based on room type) */}
                                    {selectedRoomData?.allowSeatSelection && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 uppercase tracking-wider">
                                                <IconArmchair size={16} />
                                                Seat Pricing (Per Seat)
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-slate-500">Seat Price per Hour</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <Input
                                                            type="number"
                                                            value={seatPricePerHour}
                                                            onChange={(e) => setSeatPricePerHour(e.target.value)}
                                                            className="pl-8 bg-white border-slate-300"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-slate-500">Seat Price per Day</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <Input
                                                            type="number"
                                                            value={seatPricePerDay}
                                                            onChange={(e) => setSeatPricePerDay(e.target.value)}
                                                            className="pl-8 bg-white border-slate-300"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-slate-500">Seat Price per Week</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                        <Input
                                                            type="number"
                                                            value={seatPricePerWeek}
                                                            onChange={(e) => setSeatPricePerWeek(e.target.value)}
                                                            className="pl-8 bg-white border-slate-300"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ROOM PRICING */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-blue-700 uppercase tracking-wider">
                                            <IconDoorEnter size={16} />
                                            Full Room Pricing
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-slate-500">Room Price per Hour</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={roomPricePerHour}
                                                        onChange={(e) => setRoomPricePerHour(e.target.value)}
                                                        className="pl-8 bg-white border-slate-300"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-slate-500">Room Price per Day (MAX CAP)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={roomPricePerDay}
                                                        onChange={(e) => setRoomPricePerDay(e.target.value)}
                                                        className="pl-8 bg-white border-slate-300"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-slate-500">Room Price per Week</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={roomPricePerWeek}
                                                        onChange={(e) => setRoomPricePerWeek(e.target.value)}
                                                        className="pl-8 bg-white border-slate-300"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-slate-50">
                                        <Label className="flex items-center gap-2">
                                            <IconCalendarEvent size={14} className="text-slate-400" />
                                            Effective From
                                        </Label>
                                        <Input
                                            type="date"
                                            value={effectiveFrom}
                                            onChange={(e) => setEffectiveFrom(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="bg-white border-slate-300 max-w-xs"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSave} disabled={isSaving} className="min-w-32">
                                            {isSaving ? 'Saving...' : <><IconDeviceFloppy size={18} className="mr-2" />Save Pricing</>}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Preview & Status */}
                <div className="space-y-4">
                    {selectedRoomData && (
                        <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                            {new Date(currentPricing?.effectiveFrom) > new Date() && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 transform translate-x-[20%] translate-y-[50%] rotate-45 w-24 text-center">UPCOMING</div>
                            )}
                            <CardHeader className="pb-3 text-slate-900">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <IconHistory size={18} className="text-blue-600" />
                                    Active Pricing Overview
                                </CardTitle>
                                <CardDescription>{selectedRoomData.name}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedRoomData.allowSeatSelection && (
                                    <div className="bg-emerald-50/50 rounded-lg p-3 space-y-2 border border-emerald-100">
                                        <p className="text-[10px] font-bold text-emerald-700 uppercase">Seat Rates</p>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Hourly</span>
                                            <span className="font-semibold text-slate-900">{formatPrice(currentPricing?.seatPricePerHour)}/seat</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Daily</span>
                                            <span className="font-semibold text-slate-900">{formatPrice(currentPricing?.seatPricePerDay)}/seat</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Weekly</span>
                                            <span className="font-semibold text-slate-900">{formatPrice(currentPricing?.seatPricePerWeek)}/seat</span>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-blue-50/50 rounded-lg p-3 space-y-2 border border-blue-100">
                                    <p className="text-[10px] font-bold text-blue-700 uppercase">Full Room Rates</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Hourly</span>
                                        <span className="font-semibold text-slate-900">{formatPrice(currentPricing?.roomPricePerHour)}/room</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Daily</span>
                                        <span className="font-semibold text-slate-900">{formatPrice(currentPricing?.roomPricePerDay)}/room</span>
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-between items-end border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Effective From</p>
                                        <p className="text-xs font-medium text-slate-600">{currentPricing?.effectiveFrom ? formatDateShort(currentPricing.effectiveFrom) : 'Immediate'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!selectedRoom && (
                        <Card className="bg-slate-50 border-slate-200 border-dashed">
                            <CardContent className="py-8 text-center">
                                <IconCurrencyRupee size={32} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500">Select a room to see current rates</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Pricing History Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <IconHistory size={20} className="text-blue-600" />
                            Pricing History
                        </CardTitle>
                        <CardDescription>Historical price changes and effective dates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                    <tr>
                                        <th className="px-4 py-3">Room / Asset</th>
                                        <th className="px-4 py-3">Effective Date</th>
                                        <th className="px-4 py-3">Seat Rates (H/D/W)</th>
                                        <th className="px-4 py-3">Room Rates (H/D/W)</th>
                                        <th className="px-4 py-3">Changed At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...(pricingHistory || [])].reverse().map((history, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-4 font-medium text-slate-900">
                                                {rooms.find(r => r.id === history.roomId)?.name || history.roomId}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className="font-medium text-blue-700 bg-blue-50 border-blue-100">
                                                    {formatDateShort(history.effectiveFrom)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                {formatPrice(history.seatPricePerHour)} / {formatPrice(history.seatPricePerDay)} / {formatPrice(history.seatPricePerWeek)}
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                {formatPrice(history.roomPricePerHour)} / {formatPrice(history.roomPricePerDay)} / {formatPrice(history.roomPricePerWeek)}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-400 italic">
                                                {new Date(history.updatedAt || history.replacedAt).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                    {pricingHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">
                                                No pricing history found for this session.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
