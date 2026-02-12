import { useState, useMemo, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./bootstrap"; // Axios config
import { Login } from "@/Pages/Login";
import { ErrorLog } from "@/Components/error-table";
import { toast } from "sonner";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { PageTransition } from "@/Components/PageTransition";
import { ProgressBar } from "@/Components/ProgressBar";

// Page imports
// RingkasanUtama import removed
import { SemuaLog } from "@/Pages/semua-log";
import { ManajemenAplikasi } from "@/Pages/manajemen-aplikasi";
import { ManajemenPengguna } from "@/Pages/manajemen-pengguna";
import { ProfilPengguna } from "@/Pages/profil-pengguna";
import { KonfigurasiEmail } from "@/Pages/konfigurasi-email";
import { DokumentasiAPI } from "@/Pages/dokumentasi-api";
import { PusatArsip } from "@/Pages/pusat-arsip";
import { Beranda } from "@/Pages/beranda";
import { LaporanAnalitik } from "@/Pages/laporan-analitik";

// Application Interface and Mock Data
export interface Application {
    id: string;
    name: string;
    apiKey: string;
    status: "active" | "inactive";
    totalLogs: number;
    lastActivity: Date;
    description: string;
}

// Initial Apps removed.

// Mock data removed. Fetching from API.

export default function DashboardRoot() {
    // 1. All Hook Declarations MUST be at the top
    const [user, setUser] = useState<any>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Applications State
    const [applications, setApplications] = useState<Application[]>([]);

    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const [isLogsLoading, setIsLogsLoading] = useState(true);
    const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

    // Load read notifications when user changes
    useEffect(() => {
        if (!user) {
            setReadNotificationIds(new Set());
            return;
        }

        try {
            const key = `readNotifications_${user.id}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                setReadNotificationIds(new Set(JSON.parse(saved)));
            } else {
                setReadNotificationIds(new Set());
            }
        } catch (e) {
            console.error("Failed to load readNotifications:", e);
            setReadNotificationIds(new Set());
        }
    }, [user]);

    // Persist read notifications
    useEffect(() => {
        if (!user) return; // Don't save if no user

        const key = `readNotifications_${user.id}`;
        localStorage.setItem(key, JSON.stringify(Array.from(readNotificationIds)));
    }, [readNotificationIds, user]);

    const criticalErrors = useMemo(() => {
        return errors.filter((e) => e.severity === "critical" && !e.resolved && !readNotificationIds.has(e.id));
    }, [errors, readNotificationIds]);

    const criticalCount = criticalErrors.length;

    // Fetch Logs Function
    const fetchLogs = () => {
        // Only set loading true on initial load or manual refresh, not every polling tick
        // But for now let's just use the initial state false.
        // Wait, if I want to show skeleton on first load, I need it.
        // If I want to show it on refresh, I need to set it true before fetch.
        // But polling shouldn't flicker.
        // I'll leave 'setLoading(true)' out of the polling loop context if possible, 
        // but here it is a general function.
        // I will trust the initial state is true, and only set it false after success/fail.

        (window as any).axios.get('/api/dashboard/logs')
            .then((response: any) => {
                const mappedLogs = response.data.map((log: any) => ({
                    id: log.id.toString(),
                    timestamp: new Date(log.created_at),
                    severity: log.severity, // 'critical' | 'warning' | 'info' -> need to map 'info' to 'error' if needed, or update interface
                    message: log.message,
                    service: log.application ? log.application.app_name : 'Unknown',
                    errorCode: 'ERR-' + log.id,
                    stackTrace: log.stack_trace,
                    resolved: log.status === 'resolved',
                    status: log.status,
                    resolvedAt: log.resolved_at ? new Date(log.resolved_at) : undefined,
                    resolvedBy: log.resolved_user || null,
                    inProgressAt: log.in_progress_at ? new Date(log.in_progress_at) : undefined,
                    inProgressBy: log.in_progress_user || null,
                    metadata: log.metadata || {},
                }));
                // Sort by timestamp desc
                mappedLogs.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
                setErrors(mappedLogs);
            })
            .catch((error: any) => console.error("Gagal ambil data logs:", error))
            .finally(() => setIsLogsLoading(false));
    };

    // Fetch Apps Function
    const fetchApps = () => {
        (window as any).axios.get('/api/dashboard/apps')
            .then((response: any) => {
                const mappedApps = response.data.map((app: any) => ({
                    id: app.id.toString(),
                    name: app.app_name, // Map app_name to name
                    apiKey: app.api_key,
                    status: app.is_active ? "active" : "inactive",
                    totalLogs: 0, // Placeholder, can be calculated or fetched
                    lastActivity: new Date(app.updated_at),
                    description: "Fetched from API",
                }));
                setApplications(mappedApps);
            })
            .catch((error: any) => console.error("Gagal ambil data aplikasi:", error));
    }

    // Fetch Developers (Admin Only)
    const [developers, setDevelopers] = useState<any[]>([]);

    useEffect(() => {
        if (user?.role === 'admin') {
            (window as any).axios.get('/api/users/developers')
                .then((res: any) => {
                    const data = Array.isArray(res.data) ? res.data : Object.values(res.data);
                    setDevelopers(data);
                })
                .catch((err: any) => console.error("Failed to fetch developers:", err));
        }
    }, [user]);

    // 2. Effects
    useEffect(() => {
        // Check session on mount
        (window as any).axios.get('/api/me')
            .then((res: any) => {
                setUser(res.data);
                setIsAuthLoading(false);
            })
            .catch(() => {
                setUser(null);
                setIsAuthLoading(false);
            });

        // Fetch data on mount
        fetchLogs();
        fetchApps();
    }, []);

    // Polling for new logs every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLogs();
            fetchApps(); // Also refresh apps to update last activity
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // 3. Handlers
    const handleViewDetails = (error: ErrorLog) => {
        setSelectedError(error);
        setIsModalOpen(true);
    };

    const handleRefresh = () => {
        setIsLogsLoading(true);
        fetchLogs();
        toast.success("Data logs diperbarui");
    };

    const handleMarkAsRead = (id: string) => {
        setReadNotificationIds(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    };

    const handleMarkAllAsRead = () => {
        setReadNotificationIds(prev => {
            const newSet = new Set(prev);
            criticalErrors.forEach(err => newSet.add(err.id));
            return newSet;
        });
        toast.success("Semua notifikasi ditandai sudah dibaca");
    };



    const handleLogout = () => {
        (window as any).axios.post('/logout').then(() => {
            setUser(null);
            toast.success("Logout Berhasil");
        });
    };

    // 4. Conditional Rendering (View Logic)
    // Only return conditionally AFTER all hooks have been called
    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-cyan-500 font-medium animate-pulse">Memuat Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login onLoginSuccess={setUser} />;
    }

    // Default to Beranda if not found or unauthorized logic handling could go here

    return (
        <DashboardLayout
            criticalCount={criticalCount}
            userRole={user?.role} // Ensure role is passed
            criticalErrors={criticalErrors}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onLogout={handleLogout}
            selectedError={selectedError}
            isModalOpen={isModalOpen}
            onCloseModal={() => setIsModalOpen(false)}
            onUpdateError={handleRefresh}
            currentUser={user}
        >
            <ProgressBar />
            <PageTransition>
                <Routes>
                    <Route path="/" element={<Beranda errors={errors} onViewDetails={handleViewDetails} user={user} isLoading={isLogsLoading} />} />
                    <Route path="/beranda" element={<Navigate to="/" replace />} />

                    <Route path="/semua-log" element={<SemuaLog errors={errors} applications={applications} developers={developers} user={user} onViewDetails={handleViewDetails} onRefresh={handleRefresh} />} />
                    <Route path="/pusat-arsip" element={<PusatArsip />} />
                    <Route path="/manajemen-aplikasi" element={<ManajemenAplikasi user={user} />} />
                    <Route path="/manajemen-pengguna" element={<ManajemenPengguna />} />
                    <Route path="/profil-pengguna" element={<ProfilPengguna user={user} />} />
                    <Route path="/konfigurasi-email" element={<KonfigurasiEmail />} />
                    <Route path="/dokumentasi-api" element={<DokumentasiAPI />} />
                    <Route path="/laporan-analitik" element={<LaporanAnalitik user={user} />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </PageTransition>
        </DashboardLayout>
    );
}
