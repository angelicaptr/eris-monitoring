import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Settings,
    Bell,
    Check,
    User,
    Mail,
    BookOpen
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ModeToggle } from "@/Components/mode-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface TopBarProps {
    criticalErrors: any[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onLogout?: () => void;
}

export function TopBar({ criticalErrors, onMarkAsRead, onMarkAllAsRead, onLogout }: TopBarProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-slate-800/60 sticky top-0 z-50">
            <div className="flex items-center justify-between px-8 py-4">
                {/* Search Bar - Removed as requested, keeping space if needed or just empty */}
                <div className="flex-1"></div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    <ModeToggle />

                    {/* System Status - More subtle */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50/50 rounded-full border border-emerald-100/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                        <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">System Online</span>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1"></div>

                    {/* Notification Bell */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-full w-10 h-10">
                                <Bell className="w-5 h-5" />
                                {criticalErrors.length > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 shadow-xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900" align="end">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-slate-200">Critical Alerts</h4>
                                    <Badge variant="destructive" className="text-[10px] px-1.5 h-5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 shadow-none">
                                        {criticalErrors.length} New
                                    </Badge>
                                </div>
                                {criticalErrors.length > 0 && (
                                    <button
                                        onClick={onMarkAllAsRead}
                                        className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <ScrollArea className="h-[300px]">
                                {criticalErrors.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm flex flex-col items-center">
                                        <Check className="w-8 h-8 mb-2 text-green-500/20 dark:text-green-500/10" />
                                        No critical alerts
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50 dark:divide-slate-800">
                                        {criticalErrors.map((error) => (
                                            <div key={error.id} className="p-4 hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors relative group">
                                                <div className="pr-8">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <span className="font-bold text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">{error.service}</span>
                                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(error.timestamp, { addSuffix: true, locale: id })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-2 mt-1 font-medium">{error.message}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-3 right-3 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                    onClick={() => onMarkAsRead(error.id)}
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    {/* Settings Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-full w-10 h-10">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-1 shadow-xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1.5">Settings</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100 dark:bg-slate-800" />
                            <DropdownMenuItem onClick={() => navigate("/profil-pengguna")} className="text-sm px-2 py-2 cursor-pointer text-gray-600 dark:text-slate-300 focus:text-indigo-600 dark:focus:text-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-900/20 rounded-md">
                                <User className="w-4 h-4 mr-2.5" />
                                Profil Pengguna
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/konfigurasi-email")} className="text-sm px-2 py-2 cursor-pointer text-gray-600 dark:text-slate-300 focus:text-indigo-600 dark:focus:text-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-900/20 rounded-md">
                                <Mail className="w-4 h-4 mr-2.5" />
                                Konfigurasi Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/dokumentasi-api")} className="text-sm px-2 py-2 cursor-pointer text-gray-600 dark:text-slate-300 focus:text-indigo-600 dark:focus:text-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-900/20 rounded-md">
                                <BookOpen className="w-4 h-4 mr-2.5" />
                                Dokumentasi API
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100 dark:bg-slate-800" />
                            <DropdownMenuItem onClick={onLogout} className="text-sm px-2 py-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-md">
                                <span className="flex items-center font-medium">
                                    Logout Aplikasi
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-px bg-gray-200 mx-1"></div>

                    {/* Date Time */}
                    <div className="text-right hidden md:block">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none tracking-tight">
                            {formatTime(currentTime)}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mt-1">
                            {formatDate(currentTime)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
