import { useState, useMemo, useEffect } from "react";
import { Application } from "@/DashboardRoot";
import { ErrorTable, ErrorLog } from "@/Components/error-table";
import { FilterBar } from "@/Components/filter-bar";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ChevronLeft, ChevronRight, List, Trash2, CheckCircle, XCircle, AlertTriangle, RotateCcw, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { DateRange } from "react-day-picker";
import { PageHeader } from "@/Components/ui/page-header";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";

interface SemuaLogProps {
  errors: ErrorLog[];
  applications: Application[];
  developers?: any[];
  user?: any;
  onViewDetails: (error: ErrorLog) => void;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 15;

export function SemuaLog({ errors, applications, developers = [], user, onViewDetails, onRefresh }: SemuaLogProps) {
  // Initialize state from URL Params
  const queryParams = new URLSearchParams(window.location.search);

  const [searchQuery, setSearchQuery] = useState(queryParams.get("search") || "");
  const [selectedSeverity, setSelectedSeverity] = useState(queryParams.get("severity") || "all");
  const [selectedService, setSelectedService] = useState(queryParams.get("service") || "all");
  const [selectedStatus, setSelectedStatus] = useState(queryParams.get("status") || "all");
  const [selectedDeveloper, setSelectedDeveloper] = useState(queryParams.get("developer") || "all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const services = useMemo(() => {
    const registeredApps = applications.map(app => app.name);
    const logServices = errors.map(e => e.service);
    return Array.from(new Set([...registeredApps, ...logServices])).sort();
  }, [applications, errors]);

  // URL Sync Effect
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedSeverity !== "all") params.set("severity", selectedSeverity);
    if (selectedService !== "all") params.set("service", selectedService);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (selectedDeveloper !== "all") params.set("developer", selectedDeveloper);

    // Replace URL without reloading
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, "", newUrl);

    // Reset pagination when filters change
    setCurrentPage(1);
  }, [searchQuery, selectedSeverity, selectedService, selectedStatus, selectedDeveloper, dateRange]);

  const handleExport = () => {
    const data = filteredErrors.map(error => ({
      Timestamp: error.timestamp.toLocaleString('id-ID'),
      Severity: error.severity.toUpperCase(),
      Service: error.service,
      Code: error.errorCode,
      Message: error.message,
      Status: error.status.toUpperCase(),
      ResolvedBy: error.resolvedBy?.name || '-',
      InProgressBy: error.inProgressBy?.name || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Log Data");
    XLSX.writeFile(wb, `Log_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Log berhasil diexport ke Excel");
  };

  const filteredErrors = useMemo(() => {
    return errors.filter((error) => {
      const matchesSearch = error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.errorCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = selectedSeverity === "all" || error.severity === selectedSeverity;
      const matchesService = selectedService === "all" || error.service === selectedService;
      const matchesStatus = selectedStatus === "all" || error.status === selectedStatus;

      const matchesDeveloper = selectedDeveloper === "all" ||
        (error.inProgressBy?.id == selectedDeveloper) ||
        (error.resolvedBy?.id == selectedDeveloper);

      let matchesDate = true;
      if (dateRange?.from) {
        const fromTime = new Date(dateRange.from.setHours(0, 0, 0, 0)).getTime();
        matchesDate = error.timestamp.getTime() >= fromTime;
      }
      if (dateRange?.to && matchesDate) {
        const toTime = new Date(dateRange.to.setHours(23, 59, 59, 999)).getTime();
        matchesDate = error.timestamp.getTime() <= toTime;
      }

      return matchesSearch && matchesSeverity && matchesService && matchesDate && matchesStatus && matchesDeveloper;
    });
  }, [errors, searchQuery, selectedSeverity, selectedService, selectedStatus, selectedDeveloper, dateRange]);

  const totalPages = Math.ceil(filteredErrors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedErrors = filteredErrors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedSeverity("all");
    setSelectedService("all");
    setSelectedStatus("all");
    setSelectedDeveloper("all");
    setDateRange(undefined);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Bulk Selection Handlers
  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedErrors.map(e => e.id);
      // Combine with existing mostly to avoid duplicates if select all clicked multiple times (though checked logic handles it)
      // Actually simpler: Add all visible IDs that aren't already selected
      const newIds = [...selectedIds];
      allIds.forEach(id => {
        if (!newIds.includes(id)) newIds.push(id);
      });
      setSelectedIds(newIds);
    } else {
      // Deselect visible items only (ux choice: usually deselect all visible)
      // Or deselect ALL? Let's deselect ALL for simplicity
      setSelectedIds([]);
    }
  };

  const handleBulkStatusUpdate = (status: 'resolved' | 'open' | 'in_progress') => {
    if (selectedIds.length === 0) return;

    setIsBulkLoading(true);
    (window as any).axios.patch('/api/dashboard/logs/bulk-status', {
      ids: selectedIds,
      status: status
    })
      .then(() => {
        toast.success(`Berhasil mengubah status ${selectedIds.length} log.`);
        setSelectedIds([]);
        onRefresh();
      })
      .catch((err: any) => {
        console.error(err);
        if (err.response && err.response.status === 403) {
          toast.error(err.response.data.message || "Akses ditolak.");
        } else {
          toast.error("Gagal mengubah status log.");
        }
      })
      .finally(() => setIsBulkLoading(false));
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    setIsBulkLoading(true);
    (window as any).axios.delete('/api/dashboard/logs/bulk-delete', {
      data: { ids: selectedIds } // Delete requests need body in 'data' key for axios
    })
      .then(() => {
        toast.success(`Berhasil menghapus ${selectedIds.length} log.`);
        setSelectedIds([]);
        setIsDeleteDialogOpen(false);
        onRefresh();
      })
      .catch((err: any) => {
        console.error(err);
        toast.error("Gagal menghapus log. Pastikan Anda Admin.");
      })
      .finally(() => setIsBulkLoading(false));
  };


  const selectedLogs = useMemo(() => {
    return errors.filter(e => selectedIds.includes(e.id));
  }, [errors, selectedIds]);

  const canMarkProgress = selectedLogs.some(e => e.status !== 'in_progress');
  const canMarkResolved = selectedLogs.some(e => e.status !== 'resolved');
  const canMarkOpen = selectedLogs.some(e => e.status !== 'open');

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Semua Log Error"
        description="Tabel utama yang menampilkan seluruh riwayat error dari semua aplikasi."
        icon={List}
        titleClassName="dark:text-white"
        descriptionClassName="dark:text-slate-400"
      />

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <Card className="flex items-center gap-4 p-3 pr-6 shadow-xl border-indigo-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 ring-2 ring-indigo-500/20 dark:ring-indigo-500/10 rounded-full dark:border-indigo-900/30">
            <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {selectedIds.length} Dipilih
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex gap-2">
              {user?.role === 'developer' && (
                <>
                  {canMarkResolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:bg-slate-900 dark:text-emerald-400 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20"
                      onClick={() => handleBulkStatusUpdate('resolved')}
                      disabled={isBulkLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                  {canMarkProgress && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:bg-slate-900 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20"
                      onClick={() => handleBulkStatusUpdate('in_progress')}
                      disabled={isBulkLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark In Progress
                    </Button>
                  )}
                  {canMarkOpen && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-slate-50 hover:text-slate-700 hover:border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                      onClick={() => handleBulkStatusUpdate('open')}
                      disabled={isBulkLoading}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Mark Open
                    </Button>
                  )}
                </>
              )}
              {user?.role === 'admin' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:bg-slate-900 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isBulkLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds([])}
                disabled={isBulkLoading}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Hapus
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              Anda akan menghapus <strong className="text-slate-900 dark:text-slate-200">{selectedIds.length} log error</strong> secara permanen.
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkLoading} className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-700">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              disabled={isBulkLoading}
            >
              {isBulkLoading ? "Menghapus..." : "Ya, Hapus Log"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="p-4 border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm ring-1 ring-gray-200/60 dark:ring-slate-800 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">Filter & Pencarian</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">Advanced</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30 border-green-200 dark:border-green-800/50 shadow-sm transition-all hover:shadow-md bg-white dark:bg-transparent"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
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
            user={user}
            developers={developers}
            selectedDeveloper={selectedDeveloper}
            onDeveloperChange={setSelectedDeveloper}
          />

          <div className="flex justify-between items-center text-sm text-gray-600 px-1 pt-2 border-t border-gray-100/50">
            <div>
              {(dateRange?.from || selectedSeverity !== "all" || selectedService !== "all" || searchQuery) && (
                <span className="font-medium text-indigo-600 animate-in fade-in zoom-in duration-300 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                  Ditemukan {filteredErrors.length} hasil
                </span>
              )}
            </div>
            <div className="text-gray-400 font-medium">
              Menampilkan {paginatedErrors.length} dari {filteredErrors.length} error
            </div>
          </div>
        </div>
      </Card>

      <ErrorTable
        errors={paginatedErrors}
        onViewDetails={onViewDetails}
        onRefresh={onRefresh}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
      />

      {totalPages > 1 && (
        <Card className="p-4 border-none shadow-sm bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm ring-1 ring-gray-200/50 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="hover:bg-white hover:shadow-sm border-gray-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
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
                      className={currentPage === pageNum ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40" : "hover:bg-white hover:text-indigo-600 border-transparent hover:border-indigo-100 hover:shadow-sm text-gray-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"}
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
                className="hover:bg-white hover:shadow-sm border-gray-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
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
