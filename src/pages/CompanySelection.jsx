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
        <div className="min-h-screen bg-neutral-950 p-8">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-neutral-950 to-purple-900/10 pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Select a Company</h1>
                        <p className="text-neutral-400">Choose a company to view its dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
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

                        console.log(company, 'company')

                        return (
                            <motion.div
                                key={company.id}
                                variants={cardVariants}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    onClick={() => handleSelectCompany(company.id)}
                                    className="bg-neutral-900/60 border-neutral-800 hover:border-blue-500/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-sm overflow-hidden group"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

                                    <CardContent className="p-6 relative">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex-shrink-0">
                                                    <IconBuilding size={20} className="text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-white mb-1">
                                                        {company.name}
                                                    </h3>
                                                    <div className="flex items-start gap-1 text-neutral-400 text-xs">
                                                        <IconMapPin size={14} className="flex-shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2">{company.address}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="bg-neutral-800/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                                    <IconArmchair2 size={14} />
                                                    Total Seats
                                                </div>
                                                <p className="text-xl font-bold text-white">
                                                    {company.totalSeats}
                                                </p>
                                            </div>
                                            <div className="bg-neutral-800/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                                    <IconPercentage size={14} />
                                                    Occupancy
                                                </div>
                                                <p className="text-xl font-bold text-white">
                                                    {kpis?.occupancyPercentage || 0}%
                                                </p>
                                            </div>
                                        </div>

                                        {/* Click indicator */}
                                        <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
                                            <span className="text-sm text-neutral-500 group-hover:text-blue-400 transition-colors">
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
