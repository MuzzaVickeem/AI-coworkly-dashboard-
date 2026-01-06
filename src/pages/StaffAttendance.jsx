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
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1 className="text-2xl font-bold text-white mb-1">Staff Attendance</h1>
                <p className="text-neutral-400">{selectedLocation?.name}</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30">
                    <CardContent className="p-6">
                        <p className="text-sm text-neutral-400 mb-1">Total Staff</p>
                        <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/20 to-green-600/5 border-green-500/30">
                    <CardContent className="p-6">
                        <p className="text-sm text-neutral-400 mb-1">Present</p>
                        <p className="text-3xl font-bold text-white">{stats.present}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500/20 to-red-600/5 border-red-500/30">
                    <CardContent className="p-6">
                        <p className="text-sm text-neutral-400 mb-1">Absent</p>
                        <p className="text-3xl font-bold text-white">{stats.absent}</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="today" className="space-y-4">
                <TabsList className="bg-neutral-800 border-neutral-700">
                    <TabsTrigger value="today" className="data-[state=active]:bg-neutral-700">
                        Today
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-neutral-700">
                        History
                    </TabsTrigger>
                </TabsList>

                {/* Today's Attendance */}
                <TabsContent value="today">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-white">
                                    Attendance - {selectedDate}
                                </CardTitle>
                                {!isAdmin && (
                                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                                        View Only
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-neutral-800 hover:bg-transparent">
                                            <TableHead className="text-neutral-400">Name</TableHead>
                                            <TableHead className="text-neutral-400">Role</TableHead>
                                            <TableHead className="text-neutral-400">Status</TableHead>
                                            <TableHead className="text-neutral-400">Time In</TableHead>
                                            <TableHead className="text-neutral-400">Time Out</TableHead>
                                            {isAdmin && <TableHead className="text-neutral-400 text-right">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {locationStaff.map((staffMember) => {
                                            const attendance = getStaffAttendance(staffMember.id);
                                            return (
                                                <TableRow key={staffMember.id} className="border-neutral-800 hover:bg-neutral-800/30">
                                                    <TableCell className="font-medium text-white">{staffMember.name}</TableCell>
                                                    <TableCell className="text-neutral-300">{staffMember.role}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={attendance?.status === 'Present' ? 'default' : 'secondary'}
                                                            className={
                                                                attendance?.status === 'Present'
                                                                    ? 'bg-green-600/20 text-green-400 border-green-600/30'
                                                                    : 'bg-red-600/20 text-red-400 border-red-600/30'
                                                            }
                                                        >
                                                            {attendance?.status || 'Not Marked'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {attendance?.timeIn || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {attendance?.timeOut || '-'}
                                                    </TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleAttendanceChange(staffMember.id, 'Present')}
                                                                    className={`text-green-400 hover:text-green-300 hover:bg-green-600/20 ${attendance?.status === 'Present' ? 'bg-green-600/20' : ''
                                                                        }`}
                                                                >
                                                                    <IconCheck size={16} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleAttendanceChange(staffMember.id, 'Absent')}
                                                                    className={`text-red-400 hover:text-red-300 hover:bg-red-600/20 ${attendance?.status === 'Absent' ? 'bg-red-600/20' : ''
                                                                        }`}
                                                                >
                                                                    <IconX size={16} />
                                                                </Button>
                                                                {attendance?.status === 'Present' && !attendance?.timeOut && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleTimeOut(staffMember.id)}
                                                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
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
                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                    <IconCalendar size={20} className="text-blue-400" />
                                    Attendance History
                                </CardTitle>
                                <Select value={selectedDate} onValueChange={setSelectedDate}>
                                    <SelectTrigger className="w-48 bg-neutral-800 border-neutral-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-700">
                                        {last7Days.map((date) => (
                                            <SelectItem key={date} value={date} className="text-white">
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
                                        <TableRow className="border-neutral-800 hover:bg-transparent">
                                            <TableHead className="text-neutral-400">Name</TableHead>
                                            <TableHead className="text-neutral-400">Role</TableHead>
                                            <TableHead className="text-neutral-400">Status</TableHead>
                                            <TableHead className="text-neutral-400">Time In</TableHead>
                                            <TableHead className="text-neutral-400">Time Out</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {locationStaff.map((staffMember) => {
                                            const attendance = getStaffAttendance(staffMember.id);
                                            return (
                                                <TableRow key={staffMember.id} className="border-neutral-800 hover:bg-neutral-800/30">
                                                    <TableCell className="font-medium text-white">{staffMember.name}</TableCell>
                                                    <TableCell className="text-neutral-300">{staffMember.role}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={attendance?.status === 'Present' ? 'default' : 'secondary'}
                                                            className={
                                                                attendance?.status === 'Present'
                                                                    ? 'bg-green-600/20 text-green-400 border-green-600/30'
                                                                    : 'bg-red-600/20 text-red-400 border-red-600/30'
                                                            }
                                                        >
                                                            {attendance?.status || 'Not Marked'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {attendance?.timeIn || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
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
