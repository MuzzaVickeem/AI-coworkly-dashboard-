import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IconMail,
    IconLock,
    IconArmchair2,
    IconShieldCheck,
    IconEye,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuth, ROLES } from '@/context/AuthContext';
import loginBg from '@/assets/login_bg.png';
import { Toaster } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';




export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState('admin');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock authentication delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Validation based on role
        const isAdmin = loginType === 'admin';
        const validEmail = isAdmin ? 'admin@cowork.com' : 'director@cowork.com';
        const validPassword = isAdmin ? 'admin123' : 'director123';

        if (email === validEmail && password === validPassword) {
            const role = isAdmin ? ROLES.ADMIN : ROLES.DIRECTOR;
            login(email, role);
            toast.success(`Success! Welcome back, ${isAdmin ? 'Admin' : 'Director'}.`, {
                description: "You've been successfully authenticated."
            });
            navigate('/companies');
        } else {
            toast.error("Authentication Failed", {
                description: `Invalid email or password for the ${isAdmin ? 'Admin' : 'Director'} role.`
            });
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* High-quality modern background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={loginBg}
                    alt="Background"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="bg-white border-slate-200 shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        {/* Logo */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25"
                        >
                            <IconArmchair2 size={32} className="text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            CoWork Operations
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Sign in to access the dashboard
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        {/* Login Type Tabs */}
                        <Tabs value={loginType} onValueChange={setLoginType} className="mb-6">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                                <TabsTrigger
                                    value="admin"
                                    className="data-[state=active]:!bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-slate-600 flex items-center gap-2 rounded-lg transition-all shadow-md data-[state=active]:shadow-blue-500/25"
                                >
                                    <IconShieldCheck size={16} />
                                    Admin
                                </TabsTrigger>
                                <TabsTrigger
                                    value="director"
                                    className="data-[state=active]:!bg-gradient-to-br data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white text-slate-600 flex items-center gap-2 rounded-lg transition-all shadow-md data-[state=active]:shadow-violet-500/25"
                                >
                                    <IconEye size={16} />
                                    Director
                                </TabsTrigger>
                            </TabsList>

                            {/* Role Description */}
                            <motion.div
                                key={loginType}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200"
                            >
                                {loginType === 'admin' ? (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-50">
                                            <IconShieldCheck size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Full Access</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Manage tenants, mark attendance, edit data
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-violet-50">
                                            <IconEye size={18} className="text-violet-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">View Only</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Read-only access to dashboards and reports
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </Tabs>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="email" className="text-slate-700">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <IconMail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={loginType === 'admin' ? 'admin@cowork.com' : 'director@company.com'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="password" className="text-slate-700">
                                    Password
                                </Label>
                                <div className="relative">
                                    <IconLock
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="pt-2"
                            >
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full font-semibold h-11"
                                >
                                    <motion.span
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading
                                            ? 'Signing in...'
                                            : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Director'}`}
                                    </motion.span>
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
