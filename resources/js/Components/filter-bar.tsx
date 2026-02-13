import { Search } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/Components/ui/date-range-picker";

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedSeverity: string;
    onSeverityChange: (value: string) => void;
    selectedService: string;
    onServiceChange: (value: string) => void;
    selectedStatus: string;
    onStatusChange: (value: string) => void;

    services: string[];
    dateRange?: DateRange;
    onDateRangeChange?: (range: DateRange | undefined) => void;
    onReset?: () => void;

    // Developer Filter Props
    user?: any;
    developers?: any[];
    selectedDeveloper?: string;
    onDeveloperChange?: (value: string) => void;
}

export function FilterBar({
    searchQuery,
    onSearchChange,
    selectedSeverity,
    onSeverityChange,
    selectedService,
    onServiceChange,
    selectedStatus,
    onStatusChange,

    services,
    dateRange,
    onDateRangeChange,
    onReset,

    user,
    developers,
    selectedDeveloper,
    onDeveloperChange
}: FilterBarProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Top Row: Search & reset */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search error message, error code, or service..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 dark:text-slate-200 transition-all"
                    />
                </div>
                <Button
                    variant="ghost"
                    onClick={onReset}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    Reset Filter
                </Button>
            </div>

            {/* Bottom Row: Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedSeverity} onValueChange={onSeverityChange}>
                    <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                        <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={selectedService} onValueChange={onServiceChange}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                        <SelectValue placeholder="Application" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Applications</SelectItem>
                        {services.map((service) => (
                            <SelectItem key={service} value={service}>
                                {service}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Developer Filter (Admin Only) */}
                {user?.role === 'admin' && developers && onDeveloperChange && (
                    <Select value={selectedDeveloper} onValueChange={onDeveloperChange}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400">
                            <span className="truncate">
                                {selectedDeveloper === 'all' ? 'All Developers' :
                                    developers.find(d => String(d.id) === selectedDeveloper)?.name || 'Filter Developer'}
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Developers</SelectItem>
                            {developers.map((dev) => (
                                <SelectItem key={dev.id} value={String(dev.id)}>
                                    {dev.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <div className="ml-auto">
                    {onDateRangeChange && (
                        <DatePickerWithRange
                            date={dateRange}
                            setDate={onDateRangeChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
