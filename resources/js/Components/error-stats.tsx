import { Card, CardContent } from "@/Components/ui/card";
import { Activity, AlertOctagon, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/Components/ui/skeleton";
import { motion } from "framer-motion";

interface ErrorStatsProps {
    totalErrors: number;
    criticalErrors: number;
    errorRate: number;
    avgResponseTime: number;
    trend: number;
    isLoading?: boolean;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function ErrorStats({ totalErrors, criticalErrors, errorRate, avgResponseTime, trend, isLoading = false }: ErrorStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm ring-1 ring-gray-200/50">
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
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4"
        >
            <motion.div variants={item} className="h-full">
                <Card className="h-full relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900/50 group ring-1 ring-slate-200/60 dark:ring-slate-800">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-4">
                            <div className="p-2.5 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            {trend !== 0 && (
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${trend > 0 ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"} ring-1 ring-inset ${trend > 0 ? "ring-red-100 dark:ring-red-900/50" : "ring-green-100 dark:ring-green-900/50"}`}>
                                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(trend)}%
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Error</p>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight">{totalErrors.toLocaleString()}</h2>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item} className="h-full">
                <Card className="h-full relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900/50 group ring-1 ring-slate-200/60 dark:ring-slate-800">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-4">
                            <div className="p-2.5 bg-red-50/50 dark:bg-red-900/20 rounded-xl group-hover:bg-red-50 dark:group-hover:bg-red-900/30 transition-colors">
                                <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Errors</p>
                            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2 tracking-tight">{criticalErrors.toLocaleString()}</h2>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item} className="h-full">
                <Card className="h-full relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900/50 group ring-1 ring-slate-200/60 dark:ring-slate-800">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-4">
                            <div className="p-2.5 bg-orange-50/50 dark:bg-orange-900/20 rounded-xl group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 transition-colors">
                                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resolution Rate</p>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight">{errorRate}%</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">of total errors</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item} className="h-full">
                <Card className="h-full relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900/50 group ring-1 ring-slate-200/60 dark:ring-slate-800">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-4">
                            <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Resolution Time</p>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight">{avgResponseTime}h</h2>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
