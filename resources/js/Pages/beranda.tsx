import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorStats } from "@/Components/error-stats";
import { ErrorChart } from "@/Components/error-chart";
import { ErrorLog } from "@/Components/error-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Radio, Pause, Play, Trash2, LayoutDashboard, BarChart3, Activity } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";
import { motion } from "framer-motion";
import axios from "axios";

interface BerandaProps {
  errors: ErrorLog[];
  onViewDetails: (error: ErrorLog) => void;
  user: any;
  isLoading?: boolean;
}

const generateChartData = (errors: ErrorLog[]) => {
  const data = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourStart = hour.getTime();
    const hourEnd = hourStart + 60 * 60 * 1000;

    const hourErrors = errors.filter(
      (err) => err.timestamp.getTime() >= hourStart && err.timestamp.getTime() < hourEnd
    );

    data.push({
      time: hour.getHours() + ":00",
      critical: hourErrors.filter((e) => e.severity === "critical").length,
      error: hourErrors.filter((e) => e.severity === "error").length,
      warning: hourErrors.filter((e) => e.severity === "warning").length,
    });
  }

  return data;
};

const severityColors: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100",
  error: "bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-100",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-100",
  info: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100",
};

export function Beranda({ errors, user, isLoading = false, onViewDetails }: BerandaProps) {
  const navigate = useNavigate();
  // State for all errors (initialized with props, updated via polling)
  const [allErrors, setAllErrors] = useState<ErrorLog[]>(errors);

  // Live Stream logic
  const [isStreaming, setIsStreaming] = useState(true);
  const [clearedAt, setClearedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date());

  // Polling for new logs
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      setNow(new Date());

      try {
        // Fetch latest 20 logs
        const response = await axios.get('/api/dashboard/logs?limit=20');
        const newLogs = response.data.map((log: any) => ({
          ...log,
          timestamp: new Date(log.created_at || log.timestamp), // Ensure date object
        }));

        setAllErrors(prevErrors => {
          // Merge new logs with existing, avoiding duplicates by ID
          const existingIds = new Set(prevErrors.map(e => e.id));
          const uniqueNewLogs = newLogs.filter((log: ErrorLog) => !existingIds.has(log.id));

          if (uniqueNewLogs.length === 0) return prevErrors;

          // Prepend new logs and sort descending just in case
          return [...uniqueNewLogs, ...prevErrors].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        });
      } catch (error) {
        console.error("Failed to fetch live logs:", error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [isStreaming]);

  const liveLogs = useMemo(() => {
    if (!isStreaming) return [];

    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    return allErrors
      .filter(err => {
        const isRecent = err.timestamp > oneMinuteAgo;
        const isAfterClear = clearedAt ? err.timestamp > clearedAt : true;
        return isRecent && isAfterClear;
      })
      .slice(0, 5); // Limit to 5
  }, [allErrors, now, clearedAt, isStreaming]);

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
    toast(isStreaming ? "Live stream paused" : "Live stream resumed");
  };

  const handleClearLogs = () => {
    setClearedAt(new Date()); // Set barrier
    toast.success("Live stream cleared");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + "." + date.getMilliseconds().toString().padStart(3, '0');
  };

  // Stats & Chart Logic (Local Dashboard Logic)
  const stats = useMemo(() => {
    const last24Hours = allErrors.filter(
      (err) => err.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    return {
      totalErrors: last24Hours.length,
      criticalErrors: last24Hours.filter((e) => e.severity === "critical").length,
      errorRate: last24Hours.length > 0 ? ((last24Hours.length / (last24Hours.length + 1000)) * 100).toFixed(2) : "0", // Dummy denominator for rate
      avgResponseTime: Math.floor(150 + Math.random() * 100),
      trend: (Math.random() - 0.5) * 20,
    };
  }, [allErrors]);

  const chartData = useMemo(() => generateChartData(allErrors), [allErrors]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let text = "🌙 Good Evening";
    if (hour >= 4 && hour < 11) text = "🌤️ Good Morning";
    else if (hour >= 11 && hour < 15) text = "☀️ Good Afternoon";
    else if (hour >= 15 && hour < 18) text = "⛅ Good Afternoon";

    return `${text}, ${user?.name || 'User'}`;
  }, [user]);

  const handleChartClick = (_timeStr: string) => {
    navigate('/semua-log');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10 relative"
    >
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 -z-10 rounded-3xl opacity-60 pointer-events-none" />

      <PageHeader
        title={greeting}
        description="Here is today's system health summary."
        icon={LayoutDashboard}
        className="dark:text-white"
        titleClassName="dark:text-white"
        descriptionClassName="dark:text-slate-400"
      >
        <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-slate-900 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 shadow-sm ring-1 ring-green-100 dark:ring-green-900/50">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          System Operational
        </Badge>
      </PageHeader>

      <ErrorStats
        totalErrors={Number(stats.totalErrors)}
        criticalErrors={stats.criticalErrors}
        errorRate={Number(stats.errorRate)}
        avgResponseTime={stats.avgResponseTime}
        trend={Number(stats.trend.toFixed(1))}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Charts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <Tabs defaultValue="line" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50 shadow-sm">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100 leading-none">Error Activity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Last 24 hours monitoring</p>
                </div>
              </div>
              <TabsList className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1 rounded-lg h-9 shadow-sm">
                <TabsTrigger value="line" className="h-7 text-xs px-3 rounded-md data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white transition-all text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200">Line</TabsTrigger>
                <TabsTrigger value="bar" className="h-7 text-xs px-3 rounded-md data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white transition-all text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200">Bar</TabsTrigger>
              </TabsList>
            </div>
            <Card className="border-none shadow-md bg-white dark:bg-slate-900/50 ring-1 ring-gray-200/60 dark:ring-slate-800 p-1">
              <div className="p-4">
                <TabsContent value="line" className="mt-0">
                  <ErrorChart data={chartData} chartType="line" onClick={handleChartClick} />
                </TabsContent>
                <TabsContent value="bar" className="mt-0">
                  <ErrorChart data={chartData} chartType="bar" onClick={handleChartClick} />
                </TabsContent>
              </div>
            </Card>
          </Tabs>
        </motion.div>

        {/* Right Column: Live Stream */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4 h-full"
        >
          <div className="flex items-center justify-between h-auto mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50 shadow-sm animate-pulse">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100 leading-none">Live Stream</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time error logs</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleToggleStream} variant={isStreaming ? "outline" : "default"} className={isStreaming ? "border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-800 h-8 transition-colors bg-white dark:bg-transparent" : "bg-green-600 hover:bg-green-700 h-8 shadow-sm transition-colors text-white"}>
                {isStreaming ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
              <Button size="sm" onClick={handleClearLogs} variant="outline" className="text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 h-8 transition-colors bg-white dark:bg-transparent dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 dark:border-slate-800">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-md bg-white dark:bg-slate-900/50 ring-1 ring-gray-200/60 dark:ring-slate-800 overflow-hidden h-[400px] flex flex-col relative group">
            <div className="absolute top-0 right-0 p-4 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity">
              <div className={`w-24 h-24 rounded-full bg-emerald-400 blur-3xl opacity-10 ${isStreaming ? 'animate-pulse' : ''}`}></div>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-slate-300">Status: {isStreaming ? 'Monitoring...' : 'Paused'}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-slate-500">Showing latest 5 logs</span>
              </div>
            </div>

            <ScrollArea className="flex-1 bg-slate-50/30 dark:bg-slate-950/30 p-0 z-0">
              <div className="flex flex-col">
                {liveLogs.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                      <Radio className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                    </div>
                    <p className="font-medium text-sm text-gray-500 dark:text-slate-400">{isStreaming ? "Waiting for error logs..." : "Live stream paused"}</p>
                  </div>
                ) : (
                  liveLogs.map((log) => (
                    <div
                      key={log.id}
                      className="group/item flex flex-col gap-2 p-4 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500 bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm cursor-pointer border-b border-gray-50 dark:border-slate-800 last:border-0"
                      onClick={() => onViewDetails(log)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${severityColors[log.severity]} px-2 py-0.5 text-[10px] uppercase tracking-wider border font-semibold`}>
                            {log.severity}
                          </Badge>
                          <span className="text-xs font-mono text-gray-500 dark:text-slate-400">{formatTime(log.timestamp)}</span>
                        </div>
                      </div>
                      <div className="min-w-0 mt-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          {log.application ? (
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 w-fit">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                              {log.application.app_name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 italic">App Deleted</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed group-hover/item:text-blue-700 dark:group-hover/item:text-blue-400 transition-colors">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
