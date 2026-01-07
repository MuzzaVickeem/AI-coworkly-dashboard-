import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    IconPlus,
    IconPhone,
    IconMail,
    IconFile,
    IconEdit,
    IconEye,
} from '@tabler/icons-react';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function Tenants() {
    const { selectedLocationId, selectedLocation } = useLocation();
    const { isAdmin } = useAuth();
    const { getTenantsByLocation, addTenant, updateTenant } = useData();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        seatsAllocated: '',
        rent: '',
        advance: '',
        startDate: '',
        agreementFile: '',
        phone: '',
        email: '',
        status: 'Active',
    });

    const tenants = getTenantsByLocation(selectedLocationId);

    const resetForm = () => {
        setFormData({
            name: '',
            seatsAllocated: '',
            rent: '',
            advance: '',
            startDate: '',
            agreementFile: '',
            phone: '',
            email: '',
            status: 'Active',
        });
    };

    const handleAddTenant = () => {
        addTenant({
            ...formData,
            locationId: selectedLocationId,
            seatsAllocated: parseInt(formData.seatsAllocated) || 0,
            rent: parseInt(formData.rent) || 0,
            advance: parseInt(formData.advance) || 0,
            contact: {
                phone: formData.phone,
                email: formData.email,
            },
        });
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleViewTenant = (tenant) => {
        setSelectedTenant(tenant);
        setIsDrawerOpen(true);
    };

    const handleStatusChange = (tenantId, newStatus) => {
        updateTenant(tenantId, { status: newStatus });
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Tenants</h1>
                    <p className="text-slate-500">{selectedLocation?.name}</p>
                </div>
                {isAdmin && (
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                <IconPlus size={18} className="mr-2" />
                                Add Tenant
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-slate-900">Add New Tenant</DialogTitle>
                                <DialogDescription className="text-slate-500">
                                    Add a new tenant to {selectedLocation?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label className="text-slate-700">Company Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-slate-700">Seats Required</Label>
                                        <Input
                                            type="number"
                                            value={formData.seatsAllocated}
                                            onChange={(e) => setFormData({ ...formData, seatsAllocated: e.target.value })}
                                            className="bg-white border-slate-300 text-slate-900"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-slate-700">Monthly Rent (₹)</Label>
                                        <Input
                                            type="number"
                                            value={formData.rent}
                                            onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                                            className="bg-white border-slate-300 text-slate-900"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-slate-700">Advance (₹)</Label>
                                        <Input
                                            type="number"
                                            value={formData.advance}
                                            onChange={(e) => setFormData({ ...formData, advance: e.target.value })}
                                            className="bg-white border-slate-300 text-slate-900"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-slate-700">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="bg-white border-slate-300 text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-slate-700">Phone</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-white border-slate-300 text-slate-900"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-slate-700">Email</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-white border-slate-300 text-slate-900"
                                            placeholder="contact@company.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-700">Agreement File</Label>
                                    <Input
                                        value={formData.agreementFile}
                                        onChange={(e) => setFormData({ ...formData, agreementFile: e.target.value })}
                                        className="bg-white border-slate-300 text-slate-900"
                                        placeholder="agreement.pdf (simulated)"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddTenant} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Add Tenant
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </motion.div>

            {/* Tenant Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 hover:bg-transparent">
                                    <TableHead className="text-slate-500 font-medium">Company</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Seats</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Rent</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Status</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Contact</TableHead>
                                    <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.length === 0 ? (
                                    <TableRow className="border-slate-200">
                                        <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                                            No tenants found for this location
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tenants.map((tenant) => (
                                        <TableRow key={tenant.id} className="border-slate-200 hover:bg-slate-50">
                                            <TableCell className="font-medium text-slate-900">{tenant.name}</TableCell>
                                            <TableCell className="text-slate-600">{tenant.seatsAllocated}</TableCell>
                                            <TableCell className="text-slate-600">₹{tenant.rent.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={tenant.status === 'Active' ? 'default' : 'secondary'}
                                                    className={
                                                        tenant.status === 'Active'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }
                                                >
                                                    {tenant.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <IconPhone size={14} />
                                                    <span className="text-sm">{tenant.contact?.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewTenant(tenant)}
                                                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <IconEye size={16} />
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <IconEdit size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tenant Detail Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="bg-white border-slate-200 text-slate-900 w-96 shadow-2xl">
                    <SheetHeader>
                        <SheetTitle className="text-slate-900">{selectedTenant?.name}</SheetTitle>
                        <SheetDescription className="text-slate-500">
                            Tenant Details
                        </SheetDescription>
                    </SheetHeader>
                    {selectedTenant && (
                        <div className="mt-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 mb-2">Status</h4>
                                {isAdmin ? (
                                    <Select
                                        value={selectedTenant.status}
                                        onValueChange={(value) => {
                                            handleStatusChange(selectedTenant.id, value);
                                            setSelectedTenant({ ...selectedTenant, status: value });
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-white border-slate-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200">
                                            <SelectItem value="Active" className="text-slate-900">Active</SelectItem>
                                            <SelectItem value="Inactive" className="text-slate-900">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge
                                        variant={selectedTenant.status === 'Active' ? 'default' : 'secondary'}
                                        className={
                                            selectedTenant.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : ''
                                        }
                                    >
                                        {selectedTenant.status}
                                    </Badge>
                                )}
                            </div>

                            <Separator className="bg-slate-200" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Seats</h4>
                                    <p className="text-lg font-semibold text-slate-900">{selectedTenant.seatsAllocated}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Monthly Rent</h4>
                                    <p className="text-lg font-semibold text-slate-900">₹{selectedTenant.rent.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Advance</h4>
                                    <p className="text-lg font-semibold text-slate-900">₹{selectedTenant.advance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Start Date</h4>
                                    <p className="text-lg font-semibold text-slate-900">{selectedTenant.startDate}</p>
                                </div>
                            </div>

                            <Separator className="bg-slate-200" />

                            <div>
                                <h4 className="text-sm font-medium text-slate-500 mb-3">Contact</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <IconPhone size={16} />
                                        <span>{selectedTenant.contact?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <IconMail size={16} />
                                        <span>{selectedTenant.contact?.email}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-200" />

                            <div>
                                <h4 className="text-sm font-medium text-slate-500 mb-2">Agreement</h4>
                                <div className="flex items-center gap-2 text-blue-600">
                                    <IconFile size={16} />
                                    <span className="text-sm">{selectedTenant.agreementFile}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
