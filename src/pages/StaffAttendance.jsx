import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconCalendar, IconCheck, IconX, IconClock } from '@tabler/icons-react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function StaffAttendance() {
    const { selectedLocationId, selectedLocation } = useLocation();
    const { isAdmin } = useAuth();
    const {
        getStaffByLocation,
        getAttendanceByLocationAndDate,
        updateAttendance,
        getAttendanceStats,
        staff: allStaff,
        attendance: allAttendance,
    } = useData();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [locationStaff, setLocationStaff] = useState([]);
    const [dateAttendance, setDateAttendance] = useState([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

    // Generate last 7 days for history
    const getLast7Days = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const last7Days = getLast7Days();

    useEffect(() => {
        const staff = getStaffByLocation(selectedLocationId);
        setLocationStaff(staff);

        const attendance = getAttendanceByLocationAndDate(selectedLocationId, selectedDate);
        setDateAttendance(attendance);

        const attendanceStats = getAttendanceStats(selectedLocationId, selectedDate);
        setStats(attendanceStats);
    }, [selectedLocationId, selectedDate, getStaffByLocation, getAttendanceByLocationAndDate, getAttendanceStats, allAttendance]);

    const getStaffAttendance = (staffId) => {
        return dateAttendance.find((a) => a.staffId === staffId);
    };

    const handleAttendanceChange = (staffId, status) => {
        const timeIn = status === 'Present' ? new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : null;
        updateAttendance(staffId, selectedDate, { status, timeIn, timeOut: null });
    };

    const handleTimeOut = (staffId) => {
        const timeOut = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        updateAttendance(staffId, selectedDate, { timeOut });
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Staff Attendance</h1>
                <p className="text-slate-500">{selectedLocation?.name}</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-500 mb-1">Total Staff</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-500 mb-1">Present</p>
                        <p className="text-3xl font-bold text-emerald-600">{stats.present}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-500 mb-1">Absent</p>
                        <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="today" className="space-y-4">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="today" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                        Today
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                        History
                    </TabsTrigger>
                </TabsList>

                {/* Today's Attendance */}
                <TabsContent value="today">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                                <CardTitle className="text-lg font-semibold text-slate-900">
                                    Attendance - {selectedDate}
                                </CardTitle>
                                {!isAdmin && (
                                    <Badge className="bg-violet-50 text-violet-700 border border-violet-200">
                                        View Only
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-200 hover:bg-transparent">
                                            <TableHead className="text-slate-500 font-medium">Name</TableHead>
                                            <TableHead className="text-slate-500 font-medium">Role</TableHead>
                                            <TableHead className="text-slate-500 font-medium">Status</TableHead>
                                            <TableHead className="text-slate-500 font-medium">Time In</TableHead>
                                            <TableHead className="text-slate-500 font-medium">Time Out</TableHead>
                                            {isAdmin && <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {locationStaff.map((staffMember) => {
                                            const attendance = getStaffAttendance(staffMember.id);
                                            return (
                                                <TableRow key={staffMember.id} className="border-slate-200 hover:bg-slate-50">
                                                    <TableCell className="font-medium text-slate-900">{staffMember.name}</TableCell>
                                                    <TableCell className="text-slate-600">{staffMember.role}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={attendance?.status === 'Present' ? 'default' : 'secondary'}
                                                            className={
                                                                attendance?.status === 'Present'
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                                            }
                                                        >
                                                            {attendance?.status || 'Not Marked'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {attendance?.timeIn || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {attendance?.timeOut || '-'}
                                                    </TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleAttendanceChange(staffMember.id, 'Present')}
                                                                    className={`text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 ${attendance?.status === 'Present' ? 'bg-emerald-50' : ''
                                                                        }`}
                                                                >
                                                                    <IconCheck size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleAttendanceChange(staffMember.id, 'Absent')}
                                                                    className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${attendance?.status === 'Absent' ? 'bg-red-50' : ''
                                                                        }`}
                                                                >
                                                                    <IconX size={16} />
                                                                </Button>
                                                                {attendance?.status === 'Present' && !attendance?.timeOut && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleTimeOut(staffMember.id)}
                                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    >
                                                                        <IconClock size={16} />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* History */}
                <TabsContent value="history">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <IconCalendar size={20} className="text-blue-600" />
                                    Attendance History
                                </CardTitle>
                                <Select value={selectedDate} onValueChange={setSelectedDate}>
                                    <SelectTrigger className="w-48 bg-white border-slate-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200">
                                        {last7Days.map((date) => (
                                            <SelectItem key={date} value={date} className="text-slate-900">
                                                {new Date(date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-200 hover:bg-transparent">
                                            <TableHead className="text-slate-500 font-medium">Name</TableHead>
                                            <TableHead className="text-slate-500 font-medium">Role</TableHead>
                                            <TableHead className="text-slate-500 font-medium">Status</TableHead>
                                            <TableHead className="text-slate-500 font-medium">Time In</TableHead>
                                            <TableHead className="text-slate-500 font-medium">Time Out</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {locationStaff.map((staffMember) => {
                                            const attendance = getStaffAttendance(staffMember.id);
                                            return (
                                                <TableRow key={staffMember.id} className="border-slate-200 hover:bg-slate-50">
                                                    <TableCell className="font-medium text-slate-900">{staffMember.name}</TableCell>
                                                    <TableCell className="text-slate-600">{staffMember.role}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={attendance?.status === 'Present' ? 'default' : 'secondary'}
                                                            className={
                                                                attendance?.status === 'Present'
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                                            }
                                                        >
                                                            {attendance?.status || 'Not Marked'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {attendance?.timeIn || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {attendance?.timeOut || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
