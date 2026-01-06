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
            className="h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col fixed left-0 top-0 z-40"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <IconArmchair2 size={18} className="text-white" />
                            </div>
                            <span className="font-semibold text-white whitespace-nowrap">CoWork Ops</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {isCollapsed && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
                        <IconArmchair2 size={18} className="text-white" />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                'hover:bg-neutral-800/50',
                                isActive
                                    ? 'bg-neutral-800 text-white'
                                    : 'text-neutral-400 hover:text-white'
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
                                    className="whitespace-nowrap text-sm font-medium"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* Collapse toggle */}
            <div className="p-2 border-t border-neutral-800">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full justify-center text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                    {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
                </Button>
            </div>
        </motion.aside>
    );
}
