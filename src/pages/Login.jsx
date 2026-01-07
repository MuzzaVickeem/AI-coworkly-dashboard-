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
import { useAuth, ROLES } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

        // Login with role based on selected tab
        const role = loginType === 'admin' ? ROLES.ADMIN : ROLES.DIRECTOR;
        login(email, role);
        navigate('/companies');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-[#FAFAFA] to-slate-100" />

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
                                    className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-600 flex items-center gap-2 rounded-lg transition-all"
                                >
                                    <IconShieldCheck size={16} />
                                    Admin
                                </TabsTrigger>
                                <TabsTrigger
                                    value="director"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-600 flex items-center gap-2 rounded-lg transition-all"
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

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center text-xs text-slate-400 pt-2"
                            >
                                Demo mode — any email/password works
                            </motion.p>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
