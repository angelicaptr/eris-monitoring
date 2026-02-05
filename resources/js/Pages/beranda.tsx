import { useState, useMemo, useEffect } from "react";
import { ErrorStats } from "@/Components/error-stats";
import { ErrorChart } from "@/Components/error-chart";
import { ErrorLog } from "@/Components/error-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Radio, Pause, Play, Trash2, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";

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
  critical: "bg-red-50 text-red-700 border-red-200",
  error: "bg-orange-50 text-orange-700 border-orange-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

export function Beranda({ errors, user, isLoading = false }: BerandaProps) {
  // Live Stream logic
  const [isStreaming, setIsStreaming] = useState(true);
  const [clearedAt, setClearedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const liveLogs = useMemo(() => {
    if (!isStreaming) return [];

    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    return errors
      .filter(err => {
        const isRecent = err.timestamp > oneMinuteAgo;
        const isAfterClear = clearedAt ? err.timestamp > clearedAt : true;
        return isRecent && isAfterClear;
      })
      .slice(0, 5); // Limit to 5
  }, [errors, now, clearedAt, isStreaming]);

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
    toast(isStreaming ? "Live stream dijeda" : "Live stream dilanjutkan");
  };

  const handleClearLogs = () => {
    setClearedAt(new Date()); // Set barrier
    toast.success("Live stream dibersihkan");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + "." + date.getMilliseconds().toString().padStart(3, '0');
  };

  // Stats & Chart Logic
  const stats = useMemo(() => {
    const last24Hours = errors.filter(
      (err) => err.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    return {
      totalErrors: last24Hours.length,
      criticalErrors: last24Hours.filter((e) => e.severity === "critical").length,
      errorRate: ((last24Hours.length / 10000) * 100).toFixed(2),
      avgResponseTime: Math.floor(150 + Math.random() * 100),
      trend: (Math.random() - 0.5) * 20,
    };
  }, [errors]);

  const chartData = useMemo(() => generateChartData(errors), [errors]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let text = "🌙Selamat Malam";
    if (hour >= 4 && hour < 11) text = "🌤️Selamat Pagi";
    else if (hour >= 11 && hour < 15) text = "☀️Selamat Siang";
    else if (hour >= 15 && hour < 18) text = "⛅Selamat Sore";

    return `${text}, ${user?.name || 'Pengguna'}`;
  }, [user]);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title={greeting}
        description="Berikut ringkasan kesehatan sistem hari ini."
        icon={LayoutDashboard}
      >
        <Badge variant="outline" className="px-3 py-1 bg-white border-green-200 text-green-700 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
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

      <Tabs defaultValue="line" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">Analisis Grafik</h3>
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger value="line" className="rounded-md data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">Grafik Garis</TabsTrigger>
            <TabsTrigger value="bar" className="rounded-md data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">Grafik Batang</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="line" className="mt-0">
          <ErrorChart data={chartData} chartType="line" />
        </TabsContent>
        <TabsContent value="bar" className="mt-0">
          <ErrorChart data={chartData} chartType="bar" />
        </TabsContent>
      </Tabs>

      {/* Live Stream Section (Replaces Error History) */}
      <Card className="border-none shadow-md bg-white ring-1 ring-gray-200/60 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <div className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              Live Stream Log
            </h3>
            <p className="text-sm text-gray-500 mt-1">Monitoring real-time error yang masuk ke sistem</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleToggleStream} variant={isStreaming ? "outline" : "default"} className={isStreaming ? "border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800" : "bg-green-600 hover:bg-green-700"}>
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 mr-2" />
                  Jeda Stream
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-2" />
                  Lanjutkan
                </>
              )}
            </Button>
            <Button size="sm" onClick={handleClearLogs} variant="outline" className="text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100">
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Bersihkan
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] bg-slate-50/50 p-0">
          <div className="flex flex-col divide-y divide-gray-100">
            {liveLogs.length === 0 ? (
              <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Radio className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">{isStreaming ? "Menunggu log error masuk..." : "Live stream dijeda"}</p>
                <p className="text-sm mt-1">Belum ada data baru yang diterima</p>
              </div>
            ) : (
              liveLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 hover:bg-white transition-all duration-300 animate-in fade-in slide-in-from-top-2 border-l-4 border-l-transparent hover:border-l-blue-500 bg-white/50"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <Badge variant="outline" className={`${severityColors[log.severity]} w-24 justify-center py-1 border shadow-none font-bold tracking-wide`}>
                      {log.severity.toUpperCase()}
                    </Badge>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{log.errorCode}</span>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                          {log.service}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 truncate font-medium">{log.message}</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-400 pl-4 whitespace-nowrap bg-gray-50/50 px-2 py-1 rounded">
                    {formatTime(log.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
