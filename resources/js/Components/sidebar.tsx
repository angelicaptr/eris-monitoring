import {
    LayoutDashboard,
    List,
    Grid,
    Archive,
    User,
    Eye,
    PieChart
} from "lucide-react";
import { cn } from "@/Components/ui/utils";
import { Badge } from "@/Components/ui/badge";
import { NavLink } from "react-router-dom";

interface SidebarProps {
    criticalCount: number;
    userRole?: string;
    user?: any;
}

export function Sidebar({ criticalCount, userRole, user }: SidebarProps) {
    const allMenuItems = [
        { id: "beranda", path: "/", label: "Beranda", icon: LayoutDashboard, roles: ['admin', 'developer'] },
        { id: "semua-log", path: "/semua-log", label: "Monitoring Log", icon: List, badge: criticalCount > 0 ? criticalCount : undefined, roles: ['admin', 'developer'] },
        { id: "laporan-analitik", path: "/laporan-analitik", label: "Laporan Analitik", icon: PieChart, roles: ['admin', 'developer'] },
        { id: "pusat-arsip", path: "/pusat-arsip", label: "Pusat Arsip", icon: Archive, roles: ['admin'] },
        { id: "manajemen-aplikasi", path: "/manajemen-aplikasi", label: "Manajemen Aplikasi", icon: Grid, roles: ['admin'] },
        { id: "manajemen-pengguna", path: "/manajemen-pengguna", label: "Manajemen Pengguna", icon: User, roles: ['admin'] },
    ];

    // ... (role filtering logic remains same, removed debug logs for cleaner code)
    const menuItems = allMenuItems.filter(item => {
        if (!item.roles) return true;
        const currentRole = userRole || (user?.role) || 'guest';
        if (currentRole === 'guest') return false;
        return item.roles.some(role => role.toLowerCase() === currentRole.toLowerCase());
    });

    return (
        <div className="w-[280px] flex flex-col h-full bg-gradient-to-b from-slate-950 to-slate-900 text-slate-300 border-r border-slate-800 relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>

            <div className="p-6 pt-8 relative z-10">
                <div className="mb-10 pl-2 group">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-0.5 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        E<Eye className="w-7 h-7 text-indigo-500 fill-indigo-500/20 group-hover:text-indigo-400 group-hover:fill-indigo-400/30 transition-all duration-500 animate-[pulse_3s_ease-in-out_infinite]" strokeWidth={2.5} />RIS
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1 ml-1 group-hover:text-indigo-400 transition-colors duration-300">Error Insight</p>
                </div>

                <div className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-white/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)] border border-white/10 backdrop-blur-sm"
                                        : "hover:bg-white/5 hover:text-white border border-transparent"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                                        )}
                                        <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-indigo-400 scale-110" : "text-slate-400 group-hover:text-white group-hover:scale-105")} />
                                        <span className={cn("flex-1 text-left tracking-wide transition-all", isActive ? "font-semibold translate-x-1" : "group-hover:translate-x-1")}>{item.label}</span>
                                        {item.badge && (
                                            <Badge variant="destructive" className={cn("h-5 px-1.5 text-[10px] shadow-none transition-transform", isActive ? "bg-indigo-500 text-white scale-110" : "bg-slate-800 text-slate-400")}>
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto p-6 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm relative z-10">
                <div className="flex items-center gap-3 px-2 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-slate-800 shadow-lg group-hover:border-indigo-500/50 transition-colors">
                        <span className="text-white font-bold text-sm drop-shadow-md">
                            {(user?.name || 'A').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{user?.name || 'Administrator'}</p>
                        <p className="text-xs text-slate-400 truncate opacity-80 group-hover:opacity-100 transition-opacity">{user?.email || 'admin@eris.com'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
