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
    application?: {
        id: number;
        app_name: string;
    };
}

interface ErrorTableProps {
    errors: ErrorLog[];
    onViewDetails: (error: ErrorLog) => void;
    onRefresh?: () => void;
    selectedIds?: string[];
    onSelect?: (id: string, checked: boolean) => void;
    onSelectAll?: (checked: boolean) => void;
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

export function ErrorTable({ errors, onViewDetails, onRefresh, selectedIds = [], onSelect, onSelectAll }: ErrorTableProps) {
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

    const allSelected = errors.length > 0 && selectedIds.length === errors.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < errors.length;

    return (
        <Card className="border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm ring-1 ring-gray-200/60 dark:ring-slate-800 z-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20" />
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Error History</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">List of all errors recorded by the system</p>
                </div>
                {onRefresh && (
                    <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-900">
                        <RotateCw className="h-3.5 w-3.5" />
                        Refresh
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800">
                            {onSelectAll && (
                                <TableHead className="w-[40px] pl-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        checked={allSelected}
                                        ref={input => {
                                            if (input) input.indeterminate = isIndeterminate;
                                        }}
                                        onChange={(e) => onSelectAll(e.target.checked)}
                                    />
                                </TableHead>
                            )}
                            <TableHead className="w-[180px] pl-6 py-4 cursor-pointer font-semibold text-gray-600 text-xs uppercase tracking-wider" onClick={() => handleSort("timestamp")}>
                                <div className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                    Time <SortIcon field="timestamp" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] py-4 cursor-pointer font-semibold text-gray-600 text-xs uppercase tracking-wider" onClick={() => handleSort("severity")}>
                                <div className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                    Severity <SortIcon field="severity" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[120px] py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Code</TableHead>
                            <TableHead className="py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider min-w-[300px]">Message</TableHead>
                            <TableHead className="w-[150px] py-4 cursor-pointer font-semibold text-gray-600 text-xs uppercase tracking-wider" onClick={() => handleSort("service")}>
                                <div className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                    Application <SortIcon field="service" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[150px] py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</TableHead>
                            <TableHead className="w-[80px] pr-6 py-4 text-right font-semibold text-gray-600 text-xs uppercase tracking-wider">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedErrors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={onSelectAll ? 8 : 7} className="text-center text-gray-500 py-20">
                                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mx-auto max-w-md">
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-4">
                                            <RotateCw className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="font-medium text-gray-900">No errors found</p>
                                        <p className="text-sm text-gray-500 mt-1">System is running normally or filter is too specific</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedErrors.map((error, index) => (
                                <TableRow
                                    key={error.id}
                                    className={`group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-200 border-b border-gray-50 dark:border-slate-800 last:border-0 ${selectedIds.includes(error.id) ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''} animate-in fade-in slide-in-from-bottom-2`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {onSelect && (
                                        <TableCell className="pl-6">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                                                checked={selectedIds.includes(error.id)}
                                                onChange={(e) => onSelect(error.id, e.target.checked)}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className={onSelect ? "pl-2 font-mono text-xs text-gray-600 dark:text-slate-400 whitespace-nowrap" : "pl-6 font-mono text-xs text-gray-600 dark:text-slate-400 whitespace-nowrap"}>
                                        {formatTimestamp(error.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${severityColors[error.severity]} shadow-sm font-semibold px-2.5 py-0.5 rounded-full capitalize border`}>
                                            {error.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded w-fit border border-slate-100 dark:border-slate-700">
                                            {error.errorCode}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[400px]">
                                        <div className="truncate text-gray-700 dark:text-slate-300 font-medium text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" title={error.message}>
                                            {error.message}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-800 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-800 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {error.service}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {error.status === 'resolved' && (
                                            <div className="flex flex-col gap-1.5">
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit px-2 py-0.5 rounded-full shadow-sm font-medium text-[10px] ring-1 ring-emerald-100/50">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
                                                    Resolved
                                                </Badge>
                                                {error.resolvedBy && (
                                                    <span className="text-[10px] text-gray-400 pl-1 truncate max-w-[120px]">
                                                        by {error.resolvedBy.name || "User"}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {error.status === 'in_progress' && (
                                            <div className="flex flex-col gap-1.5">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit px-2 py-0.5 rounded-full shadow-sm font-medium text-[10px] ring-1 ring-blue-100/50">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></div>
                                                    In Progress
                                                </Badge>
                                                {error.inProgressBy && (
                                                    <span className="text-[10px] text-gray-400 pl-1 truncate max-w-[120px]">
                                                        by {error.inProgressBy.name || "User"}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {error.status === 'open' && (
                                            <Badge variant="outline" className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 w-fit px-2 py-0.5 rounded-full shadow-sm font-medium text-[10px]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-1.5"></div>
                                                Open
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewDetails(error)}
                                            className="h-8 w-8 p-0 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all rounded-lg opacity-80 group-hover:opacity-100"
                                        >
                                            <Eye className="w-4 h-4" />
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
