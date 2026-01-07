import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    IconBuilding,
    IconPhone,
    IconMail,
    IconEye,
    IconSearch,
    IconUsers,
    IconPlus,
} from '@tabler/icons-react';
import { useLocation } from '@/context/LocationContext';
import { useBooking } from '@/context/BookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { VendorDetailsDialog } from '@/components/VendorDetailsDialog';
import { useNavigate } from 'react-router-dom';

const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

export function Tenants() {
    const { isDirector } = useAuth();
    const navigate = useNavigate();
    const { selectedLocation, selectedLocationId } = useLocation();
    const { getUniqueVendorsByLocation } = useBooking();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Get unique vendors from bookings FOR THE SELECTED LOCATION ONLY
    const vendors = getUniqueVendorsByLocation(selectedLocationId);

    // Filter vendors by search query
    const filteredVendors = vendors.filter(
        (vendor) =>
            vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.companyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewVendor = (vendor) => {
        setSelectedVendor(vendor);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedVendor(null);
    };

    const handleGoToSeats = () => {
        navigate('/dashboard/seats');
    };

    // Calculate summary stats for this location
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.activeBookings > 0).length;
    const totalRevenue = vendors.reduce((sum, v) => sum + v.totalAmount, 0);

    // Check if this is an empty state (no bookings for this location)
    const isEmpty = vendors.length === 0;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Tenants</h1>
                <p className="text-slate-500">
                    {selectedLocation?.name} — Vendor directory
                </p>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <IconBuilding size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Vendors</p>
                                <p className="text-2xl font-bold text-blue-600">{totalVendors}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50">
                                <IconUsers size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Active Vendors</p>
                                <p className="text-2xl font-bold text-emerald-600">{activeVendors}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-50">
                                <IconBuilding size={20} className="text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Revenue</p>
                                <p className="text-2xl font-bold text-violet-600">{formatPrice(totalRevenue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Vendor Table or Empty State */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            Vendor Directory
                        </CardTitle>
                        {!isEmpty && (
                            <div className="relative w-72">
                                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Search by company, ID, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-white border-slate-300 text-slate-900"
                                />
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {isEmpty ? (
                            /* Empty State - No tenants for this location */
                            <div className="text-center py-20 px-8">
                                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                                    <IconBuilding size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                    No tenants found for this location
                                </h3>
                                <p className="text-slate-500 max-w-md mx-auto mb-8">
                                    Tenants are added automatically when you complete a room booking.
                                    Book a room in the Seats page to add your first tenant.
                                </p>
                                {!isDirector && (
                                    <Button
                                        onClick={handleGoToSeats}
                                        className=""
                                    >
                                        <IconPlus size={18} className="mr-2" />
                                        Book a Room
                                    </Button>
                                )}
                            </div>
                        ) : filteredVendors.length === 0 ? (
                            /* No search results */
                            <div className="text-center py-16">
                                <IconSearch size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 mb-2">No vendors match your search</p>
                                <p className="text-sm text-slate-400">
                                    Try a different search term
                                </p>
                            </div>
                        ) : (
                            /* Vendor Table */
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200 hover:bg-transparent">
                                        <TableHead className="text-slate-500 font-medium">Company Name</TableHead>
                                        <TableHead className="text-slate-500 font-medium">Company ID</TableHead>
                                        <TableHead className="text-slate-500 font-medium">Contact Details</TableHead>
                                        <TableHead className="text-slate-500 font-medium text-center">Bookings</TableHead>
                                        <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVendors.map((vendor) => (
                                        <TableRow
                                            key={vendor.companyId}
                                            className="border-slate-200 hover:bg-slate-50 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                        <IconBuilding size={18} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{vendor.companyName}</p>
                                                        {/* {vendor.activeBookings > 0 && (
                                                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs mt-0.5">
                                                                {vendor.activeBookings} Active
                                                            </Badge>
                                                        )} */}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    {vendor.companyId}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <IconPhone size={14} className="text-slate-400" />
                                                        {vendor.contact?.phone || '—'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <IconMail size={14} className="text-slate-400" />
                                                        {vendor.contact?.email || '—'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-lg font-semibold text-slate-900">
                                                    {vendor.totalBookings}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewVendor(vendor)}
                                                    className=""
                                                >
                                                    <IconEye size={18} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Vendor Details Dialog */}
            <VendorDetailsDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                vendor={selectedVendor}
            />
        </div >
    );
}
