import { Card, CardContent } from "@/Components/ui/card";
import { Activity, AlertOctagon, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/Components/ui/skeleton";

interface ErrorStatsProps {
    totalErrors: number;
    criticalErrors: number;
    errorRate: number;
    avgResponseTime: number;
    trend: number;
    isLoading?: boolean;
}

export function ErrorStats({ totalErrors, criticalErrors, errorRate, avgResponseTime, trend, isLoading = false }: ErrorStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-none shadow-md bg-white/50 backdrop-blur-sm ring-1 ring-gray-200/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-4">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm ring-1 ring-gray-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        {trend !== 0 && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                                {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {Math.abs(trend)}%
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Error</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">{totalErrors.toLocaleString()}</h2>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm ring-1 ring-gray-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-4">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <AlertOctagon className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Critical Errors</p>
                        <h2 className="text-3xl font-bold text-red-600 mt-2">{criticalErrors.toLocaleString()}</h2>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm ring-1 ring-gray-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-4">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">{errorRate}%</h2>
                        <p className="text-xs text-gray-400 mt-1">of total errors</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm ring-1 ring-gray-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Clock className="h-5 w-5 text-indigo-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg Resolution Time</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">{avgResponseTime}h</h2>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
