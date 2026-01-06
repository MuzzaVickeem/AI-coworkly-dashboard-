import { useState, useEffect } from 'react';
import { Outlet, useLocation as useRouterLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
    const location = useRouterLocation();
    const [sidebarWidth, setSidebarWidth] = useState(256);

    // Listen for sidebar width changes via CSS custom property or state
    // For now, we'll handle this with a static margin that matches the sidebar

    return (
        <div className="min-h-screen bg-neutral-950">
            <Sidebar />

            {/* Main content area with left margin for sidebar */}
            <div className="ml-[256px] transition-all duration-300" style={{ marginLeft: sidebarWidth }}>
                <Header />

                {/* Page content with animations */}
                <main className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
