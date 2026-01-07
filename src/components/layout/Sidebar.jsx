import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconHome,
    IconLayoutDashboard,
    IconUsers,
    IconArmchair2,
    IconCalendarTime,
    IconChevronLeft,
    IconChevronRight,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
    {
        label: 'Dashboard',
        icon: IconLayoutDashboard,
        path: '/dashboard',
    },
    {
        label: 'Tenants',
        icon: IconUsers,
        path: '/dashboard/tenants',
    },
    {
        label: 'Seats',
        icon: IconArmchair2,
        path: '/dashboard/seats',
    },
    {
        label: 'Staff Attendance',
        icon: IconCalendarTime,
        path: '/dashboard/attendance',
    },
];

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 shadow-sm"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                                <IconArmchair2 size={18} className="text-white" />
                            </div>
                            <span className="font-semibold text-slate-900 whitespace-nowrap tracking-tight">CoWork Ops</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {isCollapsed && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto shadow-md shadow-blue-500/25">
                        <IconArmchair2 size={18} className="text-white" />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                'hover:bg-slate-50',
                                isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-slate-500 hover:text-slate-900'
                            )
                        }
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="whitespace-nowrap text-sm"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* Collapse toggle */}
            <div className="p-3 border-t border-slate-100">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                >
                    {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
                </Button>
            </div>
        </motion.aside>
    );
}
