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
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-neutral-950 to-purple-900/20" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="bg-neutral-900/80 backdrop-blur-xl border-neutral-800 shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        {/* Logo */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
                        >
                            <IconArmchair2 size={32} className="text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-white">
                            CoWork Operations
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                            Sign in to access the dashboard
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        {/* Login Type Tabs */}
                        <Tabs value={loginType} onValueChange={setLoginType} className="mb-6">
                            <TabsList className="grid w-full grid-cols-2 bg-neutral-800">
                                <TabsTrigger
                                    value="admin"
                                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
                                >
                                    <IconShieldCheck size={16} />
                                    Admin
                                </TabsTrigger>
                                <TabsTrigger
                                    value="director"
                                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2"
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
                                className="mt-4 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700"
                            >
                                {loginType === 'admin' ? (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/20">
                                            <IconShieldCheck size={18} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Full Access</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                Manage tenants, mark attendance, edit data
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-purple-500/20">
                                            <IconEye size={18} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">View Only</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">
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
                                <Label htmlFor="email" className="text-neutral-300">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <IconMail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={loginType === 'admin' ? 'admin@cowork.com' : 'director@company.com'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
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
                                <Label htmlFor="password" className="text-neutral-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <IconLock
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                                    />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
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
                                    className={`w-full font-medium h-11 transition-all duration-200 ${loginType === 'admin'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
                                        : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
                                        } text-white`}
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
                                className="text-center text-xs text-neutral-500 pt-2"
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
