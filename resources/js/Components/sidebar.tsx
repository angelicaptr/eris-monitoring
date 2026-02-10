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

    console.log("Sidebar userRole:", userRole, "User:", user);

    // Fallback: If no role, assume admin for debugging or hide everything?
    // User reported "messy" empty sidebar. 
    // Let's default to showing everything if userRole is undefined to verify layout first.
    // Or better, check if userRole is undefined.

    const menuItems = allMenuItems.filter(item => {
        if (!item.roles) return true;
        // FAILSAFE: If role is missing, default to 'guest' to avoid leaking admin menus.
        // DashboardRoot now guarantees render only after auth check, so userRole should be present if logged in.
        const currentRole = userRole || (user?.role) || 'guest';
        if (currentRole === 'guest') {
            // Debugging: If guest, user might be logged in but role is missing.
            // Don't return false yet, let's inspect.
            // keeping return false for security, but we need to know why.
            return false;
        }

        return item.roles.some(role => role.toLowerCase() === currentRole.toLowerCase());
    });

    return (
        <div className="w-[280px] flex flex-col h-full bg-eris-slate-950 text-slate-300 border-r border-slate-800">
            <div className="p-6 pt-8">
                <div className="mb-10 pl-2">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-0.5">
                        E<Eye className="w-7 h-7 text-eris-indigo-600 fill-indigo-500/20" strokeWidth={2.5} />RIS
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1 ml-1">Error Insight</p>
                </div>

                <div className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-eris-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                        : "hover:bg-slate-800/50 hover:text-white"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                        <span className="flex-1 text-left tracking-wide">{item.label}</span>
                                        {item.badge && (
                                            <Badge variant="destructive" className={cn("h-5 px-1.5 text-[10px] shadow-none", isActive ? "bg-white text-eris-indigo-600 hover:bg-white" : "")}>
                                                {item.badge}
                                            </Badge>
                                        )}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full hidden" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto p-6 border-t border-slate-800 bg-eris-slate-900">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-eris-indigo-600 to-purple-600 flex items-center justify-center border border-slate-700 shadow-md">
                        <span className="text-white font-bold text-sm">
                            {(user?.name || 'A').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                        <p className="text-xs text-slate-400 truncate opacity-80">{user?.email || 'admin@eris.com'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
