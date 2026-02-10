import { useState, useEffect } from "react";
import { ErrorStats } from "@/Components/error-stats";
import { TrendChart, DistributionChart, ComparisonChart, SeverityChart } from "@/Components/dashboard-charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Calendar as CalendarIcon, PieChart, BarChart3, Activity, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";

interface LaporanAnalitikProps {
    user: any;
}

export function LaporanAnalitik({ user }: LaporanAnalitikProps) {
    // --- Analytics State ---
    const [range, setRange] = useState("7_days");
    const [analytics, setAnalytics] = useState<any>({
        total_errors: 0,
        resolved: 0,
        pending: 0,
        critical: 0,
        avg_resolution_time: 0,
        trend: []
    });
    const [topErrors, setTopErrors] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [severityData, setSeverityData] = useState<any[]>([]);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
    const [chartErrors, setChartErrors] = useState<Record<string, boolean>>({});

    // --- Fetch Analytics ---
    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsAnalyticsLoading(true);
            setChartErrors({});
            try {
                // Use allSettled to prevent one failure from breaking the whole page
                // Order: Summary, TopErrors, Comparison, Severity
                const results = await Promise.allSettled([
                    (window as any).axios.get(`/api/analytics/summary?range=${range}`),
                    (window as any).axios.get(`/api/analytics/top-errors?range=${range}`),
                    (window as any).axios.get(`/api/analytics/app-comparison?range=${range}`),
                    (window as any).axios.get(`/api/analytics/severity-distribution?range=${range}`)
                ]);

                // 0: Summary
                if (results[0].status === 'fulfilled') {
                    setAnalytics(results[0].value.data);
                } else {
                    console.error("Summary failed", results[0].reason);
                    toast.error("Gagal memuat ringkasan data.");
                }

                // 1: Top Errors
                if (results[1].status === 'fulfilled') {
                    setTopErrors(results[1].value.data);
                } else {
                    setChartErrors(prev => ({ ...prev, topErrors: true }));
                }

                // 2: Comparison
                if (results[2].status === 'fulfilled') {
                    setComparisonData(results[2].value.data);
                } else {
                    setChartErrors(prev => ({ ...prev, comparison: true }));
                }

                // 3: Severity
                if (results[3].status === 'fulfilled') {
                    setSeverityData(results[3].value.data);
                } else {
                    setChartErrors(prev => ({ ...prev, severity: true }));
                }

            } catch (error) {
                console.error("Unexpected analytics error:", error);
                toast.error("Gagal memuat sebagian data analitik.");
            } finally {
                setIsAnalyticsLoading(false);
            }
        };

        fetchAnalytics();
    }, [range]);

    // Calculate error rate
    const resolveRate = analytics.total_errors > 0
        ? ((analytics.resolved / analytics.total_errors) * 100).toFixed(1)
        : "0";

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Laporan Analitik"
                    description="Analisis performa aplikasi dan tren error dalam periode waktu tertentu."
                    icon={PieChart}
                />

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[150px] border-0 shadow-none focus:ring-0 h-9 p-0 text-sm font-medium text-slate-700">
                            <SelectValue placeholder="Pilih Periode" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="7_days">7 Hari Terakhir</SelectItem>
                            <SelectItem value="30_days">30 Hari Terakhir</SelectItem>
                            <SelectItem value="all_time">Semua Waktu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics Stats */}
            <ErrorStats
                totalErrors={analytics.total_errors}
                criticalErrors={analytics.critical || 0}
                errorRate={Number(resolveRate)}
                avgResponseTime={analytics.avg_resolution_time}
                trend={0}
                isLoading={isAnalyticsLoading}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Global Trend (Full Width / Span 2 on Large) */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-rose-500" />
                            <CardTitle className="text-base font-semibold text-slate-800">Tren Error Global</CardTitle>
                        </div>
                        <CardDescription>Volume error yang tercatat sistem setiap hari</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <TrendChart data={analytics.trend} title="" />
                    </CardContent>
                </Card>

                {/* 2. Severity Distribution (Compact) */}
                <Card className="col-span-1 shadow-sm border-slate-200">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <CardTitle className="text-base font-semibold text-slate-800">Distribusi Severity</CardTitle>
                        </div>
                        <CardDescription>Proporsi tingkat keparahan error</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <SeverityChart data={severityData} title="" />
                    </CardContent>
                </Card>

                {/* 3. App Comparison (Mid Size) */}
                <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                            <CardTitle className="text-base font-semibold text-slate-800">
                                {user.role === 'admin' ? "Produktifitas Developer" : "Perbandingan Aplikasi"}
                            </CardTitle>
                        </div>
                        <CardDescription>
                            {user.role === 'admin'
                                ? "Jumlah error yang berhasil diselesaikan per developer"
                                : "Jumlah error per aplikasi yang ditugaskan"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {comparisonData.length > 0 ? (
                            <ComparisonChart data={comparisonData} title="" />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
                                <span className="text-sm font-medium">
                                    {user.role === 'admin' ? "Belum ada data developer" : "Belum ada data aplikasi"}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Top Errors / ranking (Compact/Side) */}
                <Card className="col-span-1 shadow-sm border-slate-200">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-emerald-500" />
                            <CardTitle className="text-base font-semibold text-slate-800">
                                {user.role === 'admin' ? "Top Aplikasi Bermasalah" : "Kategori Error Terbanyak"}
                            </CardTitle>
                        </div>
                        <CardDescription>Ranking sumber masalah utama</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        {chartErrors.topErrors ? (
                            <div className="flex flex-col items-center justify-center text-red-500">
                                <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
                                <span className="text-sm font-medium">Gagal memuat data</span>
                            </div>
                        ) : topErrors.length > 0 ? (
                            <DistributionChart
                                data={topErrors}
                                title=""
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="text-sm font-medium">Tidak ada data ranking</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
