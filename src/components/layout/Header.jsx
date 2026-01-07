import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/button';
import {
    IconBuilding,
    IconLogout,
} from '@tabler/icons-react';

export function Header() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { selectedLocation } = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/Home');
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Left - Company Info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                        <IconBuilding size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">
                            {selectedLocation?.name || 'No company selected'}
                        </p>
                        <p className="text-xs text-slate-500">
                            {selectedLocation?.totalSeats} seats capacity
                        </p>
                    </div>
                </div>
            </div>

            {/* Right - Logout */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                >
                    <IconLogout size={18} className="mr-2" />
                    Logout
                </Button>
            </div>
        </header>
    );
}
