import { useState, useMemo } from "react";
import { Application } from "@/DashboardRoot";
import { ErrorTable, ErrorLog } from "@/Components/error-table";
import { FilterBar } from "@/Components/filter-bar";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ChevronLeft, ChevronRight, Download, List } from "lucide-react";
import { DateRange } from "react-day-picker";
import * as XLSX from "xlsx";
import { PageHeader } from "@/Components/ui/page-header";

interface SemuaLogProps {
  errors: ErrorLog[];
  applications: Application[];
  onViewDetails: (error: ErrorLog) => void;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 15;

export function SemuaLog({ errors, applications, onViewDetails, onRefresh }: SemuaLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const services = useMemo(() => {
    const registeredApps = applications.map(app => app.name);
    const logServices = errors.map(e => e.service);
    return Array.from(new Set([...registeredApps, ...logServices])).sort();
  }, [applications, errors]);

  const filteredErrors = useMemo(() => {
    return errors.filter((error) => {
      const matchesSearch = error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.errorCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = selectedSeverity === "all" || error.severity === selectedSeverity;
      const matchesService = selectedService === "all" || error.service === selectedService;
      const matchesStatus = selectedStatus === "all" || error.status === selectedStatus;

      let matchesDate = true;
      if (dateRange?.from) {
        const fromTime = new Date(dateRange.from.setHours(0, 0, 0, 0)).getTime();
        matchesDate = error.timestamp.getTime() >= fromTime;
      }
      if (dateRange?.to && matchesDate) {
        const toTime = new Date(dateRange.to.setHours(23, 59, 59, 999)).getTime();
        matchesDate = error.timestamp.getTime() <= toTime;
      }

      return matchesSearch && matchesSeverity && matchesService && matchesDate && matchesStatus;
    });
  }, [errors, searchQuery, selectedSeverity, selectedService, selectedStatus, dateRange]);

  const totalPages = Math.ceil(filteredErrors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedErrors = filteredErrors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleExportExcel = () => {
    // Flatten data for Excel
    const dataToExport = filteredErrors.map(error => {
      // Logic User
      let user = "-";
      if (error.status === 'resolved' && error.resolvedBy) {
        user = error.resolvedBy.name || error.resolvedBy.email || "User";
      } else if (error.status === 'in_progress' && error.inProgressBy) {
        user = error.inProgressBy.name || error.inProgressBy.email || "User";
      }

      // Logic Duration (Resolved At - Timestamp)
      let duration = "-";
      if (error.resolvedAt) {
        const diffMs = error.resolvedAt.getTime() - error.timestamp.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        duration = `${hours} jam ${mins} menit`;
      }

      // Logic Status
      let statusLabel = "Open";
      if (error.status === 'in_progress') statusLabel = "In Progress";
      if (error.status === 'resolved') statusLabel = "Resolved";

      return {
        ID: error.id,
        Timestamp: error.timestamp.toLocaleString('id-ID'),
        Service: error.service,
        Severity: error.severity.toUpperCase(),
        Message: error.message,
        ErrorCode: error.errorCode,
        Status: statusLabel,
        ResolvedAt: error.resolvedAt ? error.resolvedAt.toLocaleString('id-ID') : "-",
        Duration: duration,
        User: user,
        IP_Address: error.metadata?.ip_address || error.metadata?.ipAddress || "-"
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Error");

    // Generate filename with timestamp
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Log_Error_Export_${dateStr}.xlsx`);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedSeverity("all");
    setSelectedService("all");
    setSelectedStatus("all");
    setDateRange(undefined);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Semua Log Error"
        description="Tabel utama yang menampilkan seluruh riwayat error dari semua aplikasi."
        icon={List}
      />

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filter & Pencarian</h3>
          <Button onClick={handleExportExcel} variant="outline" className="gap-2 border-indigo-200 text-eris-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
            <Download className="w-4 h-4" />
            Export Excel (.xlsx)
          </Button>
        </div>
        <div className="space-y-4">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSeverity={selectedSeverity}
            onSeverityChange={setSelectedSeverity}
            selectedService={selectedService}
            onServiceChange={setSelectedService}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            services={services}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={handleReset}
          />

          <div className="flex justify-between items-center text-sm text-gray-600 px-1">
            <div>
              {(dateRange?.from || selectedSeverity !== "all" || selectedService !== "all" || searchQuery) && (
                <span className="font-medium text-cyan-600 animate-in fade-in zoom-in duration-300">
                  Ditemukan {filteredErrors.length} hasil
                </span>
              )}
            </div>
            <div>
              Menampilkan {paginatedErrors.length} dari {filteredErrors.length} error
            </div>
          </div>
        </div>
      </Card>

      <ErrorTable errors={paginatedErrors} onViewDetails={onViewDetails} onRefresh={onRefresh} />

      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Sebelumnya
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
