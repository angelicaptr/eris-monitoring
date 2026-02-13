import { useState, useEffect } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { ErrorStats } from "@/Components/error-stats";
import { TrendChart, DistributionChart, ComparisonChart, SeverityChart } from "@/Components/dashboard-charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Calendar as CalendarIcon, PieChart, BarChart3, Activity, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";

interface LaporanAnalitikProps {
    user: any;
}

// Print Header Component (Visible only on print)
const PrintHeader = ({ user, range }: { user: any, range: string }) => (
    <div className="hidden print:block mb-8 border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Logo Placeholder - simplified for code */}
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Analytics Report</h1>
                    <p className="text-sm text-slate-500">Log Monitor Dashboard</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-slate-500">Printed by: <span className="font-medium text-slate-900">{user.name}</span></p>
                <p className="text-sm text-slate-500">Print Date: <span className="font-medium text-slate-900">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></p>
                <p className="text-sm text-slate-500 mt-1">Data Period: <span className="font-medium text-indigo-600 uppercase">{range.replace('_', ' ')}</span></p>
            </div>
        </div>
    </div>
);

// Helper for printing Lists (Severity, Apps, Rankings)
const PrintDataList = ({ data, labelKey = "label", valueKey = "value" }: { data: any[], labelKey?: string, valueKey?: string }) => (
    <div className="hidden print:block mt-4 w-full">
        <div className="text-xs font-semibold text-slate-500 mb-2 border-b border-slate-200 pb-1">Data Details</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {data.slice(0, 10).map((d, i) => ( // Limit to top 10 for print
                <div key={i} className="flex justify-between text-xs py-0.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700 truncate pr-2">{d[labelKey]}</span>
                    <span className="font-medium text-slate-900">{d[valueKey]}</span>
                </div>
            ))}
        </div>
    </div>
);

const PrintTrendTable = ({ data }: { data: any[] }) => {
    const recentData = [...data].reverse().slice(0, 5);
    return (
        <div className="hidden print:block mt-4 w-full">
            <div className="text-xs font-semibold text-slate-500 mb-2 border-b border-slate-200 pb-1">Recent Data (5 Days)</div>
            <div className="grid grid-cols-1 gap-y-1">
                {recentData.map((d, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                        <span className="text-slate-700">{new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="font-medium text-slate-900">{d.count} Errors</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function LaporanAnalitik({ user }: LaporanAnalitikProps) {
    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsAnalyticsLoading(true);
            setChartErrors({});
            try {
                const results = await Promise.allSettled([
                    (window as any).axios.get(`/api/analytics/summary?range=${range}`),
                    (window as any).axios.get(`/api/analytics/top-errors?range=${range}`),
                    (window as any).axios.get(`/api/analytics/app-comparison?range=${range}`),
                    (window as any).axios.get(`/api/analytics/severity-distribution?range=${range}`)
                ]);

                if (results[0].status === 'fulfilled') setAnalytics(results[0].value.data);
                if (results[1].status === 'fulfilled') setTopErrors(results[1].value.data);
                else setChartErrors(prev => ({ ...prev, topErrors: true }));
                if (results[2].status === 'fulfilled') setComparisonData(results[2].value.data);
                else setChartErrors(prev => ({ ...prev, comparison: true }));
                if (results[3].status === 'fulfilled') setSeverityData(results[3].value.data);
                else setChartErrors(prev => ({ ...prev, severity: true }));

            } catch (error) {
                console.error("Unexpected analytics error:", error);
                toast.error("Failed to load some analytics data.");
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

    // --- Handlers ---
    const handleSeverityClick = (label: string) => {
        navigate({
            pathname: '/semua-log',
            search: createSearchParams({ severity: label }).toString()
        });
    };

    const handleAppClick = (label: string) => {
        if (user.role === 'developer') {
            navigate({
                pathname: '/semua-log',
                search: createSearchParams({ service: label }).toString()
            });
        } else {
            navigate({
                pathname: '/semua-log',
                search: createSearchParams({ search: label }).toString()
            });
        }
    };

    const handleTopErrorClick = (label: string) => {
        if (user.role === 'admin') {
            navigate({
                pathname: '/semua-log',
                search: createSearchParams({ service: label }).toString()
            });
        } else {
            navigate({
                pathname: '/semua-log',
                search: createSearchParams({ search: label }).toString()
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500 print:space-y-4 print:pb-0">

            {/* Print Header */}
            <PrintHeader user={user} range={range} />

            {/* Header Section (Hidden on Print) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <PageHeader
                    title="Analytics Report"
                    description="Application performance analysis and error trends over a specific period."
                    icon={PieChart}
                />

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm cursor-pointer transition-colors rounded-lg h-10"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Print Report (PDF)
                    </Button>

                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[180px] h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 dark:text-slate-200 rounded-lg shadow-sm focus:ring-indigo-500/20">
                            <div className="flex items-center gap-2.5">
                                <CalendarIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <SelectValue placeholder="Select Period" />
                            </div>
                        </SelectTrigger>
                        <SelectContent align="end" className="dark:bg-slate-900 dark:border-slate-800">
                            <SelectItem value="7_days">Last 7 Days</SelectItem>
                            <SelectItem value="30_days">Last 30 Days</SelectItem>
                            <SelectItem value="all_time">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics Stats */}
            <div className="print:mb-6">
                <ErrorStats
                    totalErrors={analytics.total_errors}
                    criticalErrors={analytics.critical || 0}
                    errorRate={Number(resolveRate)}
                    avgResponseTime={analytics.avg_resolution_time}
                    trend={0}
                    isLoading={isAnalyticsLoading}
                />
            </div>

            {/* Charts Grid - Optimized for A4 Print */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:block">

                {/* 1. Global Trend */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 print:col-span-2 print:mb-4 print:break-inside-avoid shadow-none print:border">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-rose-500" />
                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Global Error Trend</CardTitle>
                        </div>
                        <CardDescription className="dark:text-slate-400">Volume of errors recorded by the system daily</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] print:h-auto print:block">
                        <div className="h-full w-full print:h-[260px] print:mb-10">
                            <TrendChart data={analytics.trend} title="" />
                        </div>
                        <PrintTrendTable data={analytics.trend} />
                    </CardContent>
                </Card>

                {/* 2. Severity Distribution */}
                <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group print:mb-4 print:break-inside-avoid print:w-[48%] print:inline-block print:align-top print:mr-[2%] shadow-none print:border">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Severity Distribution</CardTitle>
                        </div>
                        <CardDescription className="dark:text-slate-400">Proportion of error severity levels</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] print:h-[auto] flex flex-col items-center justify-center">
                        <div className="h-[200px] w-full flex justify-center">
                            <SeverityChart data={severityData} title="" onClick={handleSeverityClick} />
                        </div>
                        <PrintDataList data={severityData} />
                    </CardContent>
                </Card>

                {/* 3. App Comparison */}
                <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group print:mb-4 print:break-inside-avoid print:w-[100%] print:col-span-2 shadow-none print:border">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                {user.role === 'admin' ? "Developer Productivity" : "Application Comparison"}
                            </CardTitle>
                        </div>
                        <CardDescription className="dark:text-slate-400">
                            {user.role === 'admin'
                                ? "Number of resolved errors per developer"
                                : "Number of errors per assigned application"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] print:h-[auto] flex flex-col justify-between">
                        {comparisonData.length > 0 ? (
                            <>
                                <div className="h-[250px] w-full">
                                    <ComparisonChart data={comparisonData} title="" onClick={handleAppClick} />
                                </div>
                                <PrintDataList data={comparisonData} />
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
                                <span className="text-sm font-medium">
                                    {user.role === 'admin' ? "No developer data yet" : "No application data yet"}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Top Errors / ranking */}
                <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group print:break-inside-avoid print:w-[48%] print:inline-block print:align-top shadow-none print:border">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-emerald-500" />
                            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                {user.role === 'admin' ? "Top Problematic Apps" : "Top Error Categories"}
                            </CardTitle>
                        </div>
                        <CardDescription className="dark:text-slate-400">Ranking of main error sources</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] print:h-[auto] flex flex-col items-center justify-center">
                        {chartErrors.topErrors ? (
                            <div className="flex flex-col items-center justify-center text-red-500">
                                <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
                                <span className="text-sm font-medium">Failed to load data</span>
                            </div>
                        ) : topErrors.length > 0 ? (
                            <>
                                <div className="h-[200px] w-full flex justify-center">
                                    <DistributionChart
                                        data={topErrors}
                                        title=""
                                        onClick={handleTopErrorClick}
                                    />
                                </div>
                                <PrintDataList data={topErrors} />
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="text-sm font-medium">No ranking data</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-8 text-center text-xs text-slate-400">
                <p>This document is automatically generated from the Log Monitoring System.</p>
                <p>&copy; {new Date().getFullYear()} Eris Monitoring System.</p>
            </div>
        </div>
    );
}
