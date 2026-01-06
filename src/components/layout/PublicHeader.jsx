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
        <header className="h-16 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left - Logo/Branding */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <IconArmchair2 size={20} className="text-white" />
                </div>
                <span className="font-semibold text-white text-lg">CoWork Ops</span>
            </div>

            {/* Right - Login Button */}
            {!isLoggedIn && (
                <Button
                    onClick={handleLogin}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <IconLogin size={18} className="mr-2" />
                    Login
                </Button>
            )}
        </header>
    );
}
