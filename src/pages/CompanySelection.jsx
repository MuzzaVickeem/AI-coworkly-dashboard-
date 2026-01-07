import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IconBuilding,
    IconMapPin,
    IconArmchair2,
    IconPercentage,
    IconLogout,
} from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { locations } from '@/data/locations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


// Mock companies data (extending locations with company info)
const companies = locations.map((loc, index) => ({
    ...loc,
    companyName: loc.name.split(' - ')[0],
    locationName: loc.name.split(' - ')[1] || loc.name,
    status: index === 2 ? 'Maintenance' : 'Active',
}));

export function CompanySelection() {
    const navigate = useNavigate();
    const { selectCompany, logout } = useAuth();
    const { calculateLocationKPIs } = useData();

    const handleSelectCompany = (companyId) => {
        selectCompany(companyId);
        navigate('/dashboard');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        },
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-8">
            {/* Subtle background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-[#FAFAFA] to-slate-100/50 pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Select a Company</h1>
                        <p className="text-slate-500">Choose a company to view its dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <IconLogout size={18} className="mr-2" />
                            Logout
                        </Button>
                    </div>
                </motion.div>

                {/* Company Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center"
                >
                    {companies.map((company) => {
                        const kpis = calculateLocationKPIs(company.id);

                        return (
                            <motion.div
                                key={company.id}
                                variants={cardVariants}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    onClick={() => handleSelectCompany(company.id)}
                                    className="bg-white border-slate-200 hover:border-blue-300 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 overflow-hidden group"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-slate-50/30 transition-all duration-300" />

                                    <CardContent className="p-6 relative">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 flex-shrink-0">
                                                    <IconBuilding size={20} className="text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                                        {company.name}
                                                    </h3>
                                                    <div className="flex items-start gap-1 text-slate-500 text-xs">
                                                        <IconMapPin size={14} className="flex-shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2">{company.address}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                    <IconArmchair2 size={14} />
                                                    Total Seats
                                                </div>
                                                <p className="text-xl font-bold text-slate-900">
                                                    {company.totalSeats}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                    <IconPercentage size={14} />
                                                    Occupancy
                                                </div>
                                                <p className="text-xl font-bold text-blue-600">
                                                    {kpis?.occupancyPercentage || 0}%
                                                </p>
                                            </div>
                                        </div>

                                        {/* Click indicator */}
                                        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                            <span className="text-sm text-slate-400 group-hover:text-blue-600 transition-colors">
                                                Click to view dashboard →
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
