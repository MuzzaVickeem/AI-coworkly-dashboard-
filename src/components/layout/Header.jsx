import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IconMapPin, IconUser } from '@tabler/icons-react';

export function Header() {
    const { selectedLocationId, setSelectedLocationId, allLocations } = useLocation();
    const { currentRole, toggleRole, isAdmin } = useAuth();

    return (
        <header className="h-16 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left - Location Selector */}
            <div className="flex items-center gap-3">
                <IconMapPin size={20} className="text-neutral-400" />
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                    <SelectTrigger className="w-64 bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                        {allLocations.map((location) => (
                            <SelectItem
                                key={location.id}
                                value={location.id}
                                className="text-white hover:bg-neutral-700 focus:bg-neutral-700"
                            >
                                {location.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Right - Role Toggle */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-neutral-800 px-4 py-2 rounded-lg">
                    <IconUser size={18} className="text-neutral-400" />
                    <div className="flex items-center gap-3">
                        <Label
                            htmlFor="role-toggle"
                            className={`text-sm cursor-pointer transition-colors ${!isAdmin ? 'text-white font-medium' : 'text-neutral-500'
                                }`}
                        >
                            Director
                        </Label>
                        <Switch
                            id="role-toggle"
                            checked={isAdmin}
                            onCheckedChange={toggleRole}
                            className="data-[state=checked]:bg-blue-600"
                        />
                        <Label
                            htmlFor="role-toggle"
                            className={`text-sm cursor-pointer transition-colors ${isAdmin ? 'text-white font-medium' : 'text-neutral-500'
                                }`}
                        >
                            Admin
                        </Label>
                    </div>
                </div>
                <Badge
                    variant={isAdmin ? 'default' : 'secondary'}
                    className={isAdmin ? 'bg-blue-600' : 'bg-purple-600'}
                >
                    {currentRole}
                </Badge>
            </div>
        </header>
    );
}
