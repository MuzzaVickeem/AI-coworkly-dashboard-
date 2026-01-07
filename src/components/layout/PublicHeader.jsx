import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { IconLogin, IconArmchair2 } from '@tabler/icons-react';

export function PublicHeader() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left - Logo/Branding */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                    <IconArmchair2 size={20} className="text-white" />
                </div>
                <span className="font-semibold text-slate-900 text-lg">CoWork Ops</span>
            </div>

            {/* Right - Login Button - Always show on public pages */}
            <Button
                onClick={handleLogin}
                className=""
            >
                <IconLogin size={18} className="mr-2" />
                {isLoggedIn ? 'Dashboard' : 'Login'}
            </Button>
        </header>
    );
}
