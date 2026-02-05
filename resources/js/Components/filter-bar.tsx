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
    onReset
}: FilterBarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Cari error message atau code..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={selectedSeverity} onValueChange={onSeverityChange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Level</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={selectedService} onValueChange={onServiceChange}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Aplikasi" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Aplikasi</SelectItem>
                        {services.map((service) => (
                            <SelectItem key={service} value={service}>
                                {service}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                </Select>

                {onDateRangeChange && (
                    <DatePickerWithRange
                        date={dateRange}
                        setDate={onDateRangeChange}
                    />
                )}

                <Button
                    variant="ghost"
                    onClick={onReset}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                    title="Reset Filter"
                >
                    Reset
                </Button>
            </div>


        </div>
    );
}
