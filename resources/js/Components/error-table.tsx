import { useState } from "react";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { ChevronDown, ChevronUp, Eye, RotateCw } from "lucide-react";

export interface ErrorLog {
    id: string;
    timestamp: Date;
    severity: "critical" | "error" | "warning";
    message: string;
    service: string;
    errorCode: string;
    stackTrace?: string;
    userId?: string;
    metadata?: Record<string, any>;
    status: "open" | "in_progress" | "resolved";
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: any; // User object or ID
    inProgressAt?: Date;
    inProgressBy?: any; // User object or ID
}

interface ErrorTableProps {
    errors: ErrorLog[];
    onViewDetails: (error: ErrorLog) => void;
    onRefresh?: () => void;
}

type SortField = "timestamp" | "severity" | "service";
type SortDirection = "asc" | "desc";

const severityColors = {
    critical: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    error: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
};

const severityOrder = {
    critical: 0,
    error: 1,
    warning: 2,
};

export function ErrorTable({ errors, onViewDetails, onRefresh }: ErrorTableProps) {
    const [sortField, setSortField] = useState<SortField>("timestamp");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const sortedErrors = [...errors].sort((a, b) => {
        let comparison = 0;

        if (sortField === "timestamp") {
            comparison = a.timestamp.getTime() - b.timestamp.getTime();
        } else if (sortField === "severity") {
            comparison = severityOrder[a.severity] - severityOrder[b.severity];
        } else if (sortField === "service") {
            comparison = a.service.localeCompare(b.service);
        }

        return sortDirection === "asc" ? comparison : -comparison;
    });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />;
    };

    const formatTimestamp = (date: Date) => {
        return new Intl.DateTimeFormat("id-ID", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(date);
    };

    return (
        <Card className="border-none shadow-md bg-white ring-1 ring-gray-200/60 z-10 relative">
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Riwayat Error</h3>
                    <p className="text-sm text-gray-500">Daftar semua error yang tercatat sistem</p>
                </div>
                {onRefresh && (
                    <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2 hover:bg-gray-50">
                        <RotateCw className="h-3.5 w-3.5" />
                        Refresh
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 border-b border-gray-200">
                            <TableHead className="w-[180px] pl-6 py-4 cursor-pointer font-semibold text-gray-600 text-xs uppercase tracking-wider" onClick={() => handleSort("timestamp")}>
                                <div className="flex items-center gap-1">
                                    Waktu <SortIcon field="timestamp" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] py-4 cursor-pointer font-semibold text-gray-600 text-xs uppercase tracking-wider" onClick={() => handleSort("severity")}>
                                <div className="flex items-center gap-1">
                                    Severity <SortIcon field="severity" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[120px] py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Kode</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider min-w-[300px]">Pesan</TableHead>
                            <TableHead className="w-[150px] py-4 cursor-pointer font-semibold text-gray-600 text-xs uppercase tracking-wider" onClick={() => handleSort("service")}>
                                <div className="flex items-center gap-1">
                                    Aplikasi <SortIcon field="service" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[150px] py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</TableHead>
                            <TableHead className="w-[80px] pr-6 py-4 text-right font-semibold text-gray-600 text-xs uppercase tracking-wider">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedErrors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-16">
                                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 mx-6 my-2">
                                        <p className="font-medium text-gray-600">Tidak ada error ditemukan</p>
                                        <p className="text-xs text-gray-400 mt-1">Sistem berjalan dengan normal</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedErrors.map((error) => (
                                <TableRow key={error.id} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0">
                                    <TableCell className="pl-6 font-mono text-xs text-gray-600 whitespace-nowrap">
                                        {formatTimestamp(error.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${severityColors[error.severity]} shadow-none font-medium px-2.5 py-0.5 rounded-full capitalize`}>
                                            {error.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-gray-500 font-medium">#{error.errorCode}</TableCell>
                                    <TableCell className="max-w-[400px]">
                                        <div className="truncate text-gray-700 font-medium text-sm" title={error.message}>
                                            {error.message}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white text-slate-600 text-xs font-medium border border-slate-200 shadow-sm">
                                            {error.service}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {error.status === 'resolved' && (
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit px-2 py-0.5 rounded-full shadow-none font-normal text-[10px]">Resolved</Badge>
                                                {error.resolvedBy && (
                                                    <span className="text-[10px] text-gray-400 pl-0.5 truncate max-w-[120px]">
                                                        {error.resolvedBy.name || "User"}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {error.status === 'in_progress' && (
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit px-2 py-0.5 rounded-full shadow-none font-normal text-[10px]">Processing</Badge>
                                                {error.inProgressBy && (
                                                    <span className="text-[10px] text-gray-400 pl-0.5 truncate max-w-[120px]">
                                                        {error.inProgressBy.name || "User"}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {error.status === 'open' && (
                                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 w-fit px-2 py-0.5 rounded-full shadow-none font-normal text-[10px]">Open</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewDetails(error)}
                                            className="h-8 w-8 p-0 hover:bg-white hover:border hover:border-gray-200 hover:shadow-sm rounded-lg"
                                        >
                                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-eris-indigo-600 transition-colors" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
