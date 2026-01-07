import { useState, useEffect } from 'react';
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

export function Sidebar({ onWidthChange }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Notify parent when width changes
    useEffect(() => {
        if (onWidthChange) {
            onWidthChange(isCollapsed ? 72 : 256);
        }
    }, [isCollapsed, onWidthChange]);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 shadow-sm"
        >
            {/* Logo and Collapse Toggle */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 overflow-hidden"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 flex-shrink-0">
                                <IconArmchair2 size={16} className="text-white" />
                            </div>
                            <span className="font-semibold text-slate-900 whitespace-nowrap tracking-tight">CoWork Ops</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full flex justify-center"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                                <IconArmchair2 size={16} className="text-white" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isCollapsed && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(true)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    >
                        <IconChevronLeft size={18} />
                    </Button>
                )}
            </div>

            {isCollapsed && (
                <div className="flex justify-center py-2 border-b border-slate-50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(false)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    >
                        <IconChevronRight size={18} />
                    </Button>
                </div>
            )}

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

        </motion.aside>
    );
}
