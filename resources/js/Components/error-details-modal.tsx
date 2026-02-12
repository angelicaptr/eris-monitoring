import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Copy, CheckCircle2, Clock, Shield, Server, Terminal, Lock } from "lucide-react";
import { ErrorLog } from "@/Components/error-table";
import { toast } from "sonner";

interface ErrorDetailsModalProps {
    error: ErrorLog | null;
    open: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    currentUser?: any;
}

export function ErrorDetailsModal({ error, open, onClose, onUpdate, currentUser }: ErrorDetailsModalProps) {
    if (!error) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Disalin ke clipboard");
    };

    // Check if the current user is the one working on it
    // const isLocked = ... (unused)

    const updateStatus = (newStatus: 'open' | 'in_progress' | 'resolved') => {
        (window as any).axios.patch(`/api/dashboard/logs/${error.id}/status`, { status: newStatus })
            .then(() => {
                toast.success(`Status berhasil diubah ke ${newStatus}`);
                if (onUpdate) {
                    onUpdate();
                }
                onClose();
            })
            .catch((err: any) => {
                console.error("DEBUG STATUS ERROR:", err);
                const msg = err.response?.data?.message || err.message || "Gagal mengubah status";
                toast.error(`Gagal: ${msg}`);
            });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "from-red-500 to-red-600";
            case "error": return "from-orange-500 to-orange-600";
            case "warning": return "from-yellow-400 to-yellow-500";
            default: return "from-blue-500 to-blue-600";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 flex flex-col">
                {/* Colored Header Band */}
                <div className={`h-2 w-full bg-gradient-to-r ${getSeverityColor(error.severity)}`} />

                <DialogHeader className="px-6 pt-6 pb-2">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`border-none px-2 py-0.5 rounded-full capitalize font-semibold shadow-sm text-white bg-gradient-to-r ${getSeverityColor(error.severity)}`}>
                                    {error.severity}
                                </Badge>
                                <span className="font-mono text-xs text-slate-400">#{error.id.substring(0, 8)}...</span>
                            </div>
                            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                {error.message}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service</label>
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                <Server className="w-4 h-4 text-slate-400" />
                                {error.service}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Code</label>
                            <div className="flex items-center gap-2 text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">
                                <span className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 rounded py-0.5">{error.errorCode}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</label>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {new Date(error.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                            <div className="flex items-center gap-2">
                                {error.status === 'resolved' ? (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2">Resolved</Badge>
                                ) : error.status === 'in_progress' ? (
                                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[10px] px-2">In Progress</Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-[10px] px-2">Open</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stack Trace - Dark Mode Editor Style */}
                    {error.stackTrace && (
                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-slate-500" /> Stack Trace
                                </label>
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400 hover:text-indigo-600" onClick={() => handleCopy(error.stackTrace!)}>
                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                </Button>
                            </div>
                            <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800 ring-1 ring-slate-900/5">
                                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1e1e1e] flex items-center px-4 gap-2 border-b border-white/10">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <pre className="bg-[#1e1e1e] text-slate-300 p-4 pt-10 text-[11px] overflow-x-auto font-mono leading-relaxed custom-scrollbar">
                                    {error.stackTrace}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Metadata Grid */}
                    {error.metadata && (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Metadata</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(error.metadata).map(([key, value]) => (
                                    <div key={key} className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-indigo-400 transition-colors">{key}</span>
                                        <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate" title={String(value)}>{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer with Glassmorphism */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 flex justify-end gap-3 items-center sticky bottom-0 z-50">
                    {/* Access Control Logic for Buttons */}
                    {(() => {
                        const isDev = currentUser?.role === 'developer';
                        const isAdmin = currentUser?.role === 'admin';
                        const myId = currentUser?.id;

                        // Claimed by someone else?
                        const claimedByOther = (error.inProgressBy && String(error.inProgressBy.id) !== String(myId)) ||
                            (error.resolvedBy && String(error.resolvedBy.id) !== String(myId));

                        const claimerName = error.inProgressBy?.name || error.resolvedBy?.name || "Someone";

                        // Status Actions
                        if (error.status === 'open') {
                            // Admin cannot claim, only developers can claim
                            if (isDev) {
                                return (
                                    <Button
                                        onClick={() => updateStatus('in_progress')}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Ambil (Claim)
                                    </Button>
                                );
                            }
                        } else if (error.status === 'in_progress') {
                            // If I am the claimer, I can Resolve or Return to Open
                            if (isDev && !claimedByOther) {
                                return (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => updateStatus('open')}
                                            className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 dark:bg-slate-900"
                                        >
                                            Kembalikan ke Open
                                        </Button>
                                        <Button
                                            onClick={() => updateStatus('resolved')}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Tandai Selesai
                                        </Button>
                                    </div>
                                );
                            }
                            // If claimed by other
                            if (claimedByOther) {
                                return (
                                    <div className="flex items-center gap-4 bg-orange-50/50 dark:bg-orange-900/10 pr-2 pl-4 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
                                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center">
                                            <Lock className="w-3 h-3 mr-1.5" />
                                            Sedang dikerjakan oleh <span className="font-bold ml-1">{claimerName}</span>
                                        </span>
                                        {/* Admin Override */}
                                        {isAdmin && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => updateStatus('open')}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 h-7 text-xs px-2"
                                            >
                                                Force Release
                                            </Button>
                                        )}
                                    </div>
                                );
                            }
                            // Admin viewing their own claim (unlikely role mix but possible) or unclaimed in_progress (bug?)
                            if (isAdmin) {
                                return (
                                    <Button
                                        variant="outline"
                                        onClick={() => updateStatus('open')}
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:bg-slate-900 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                    >
                                        Force Release (Admin)
                                    </Button>
                                );
                            }
                        } else if (error.status === 'resolved') {
                            if (isDev && !claimedByOther) {
                                return (
                                    <Button
                                        variant="outline"
                                        onClick={() => updateStatus('in_progress')}
                                        className="text-slate-600 border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                                    >
                                        Buka Kembali (Re-open)
                                    </Button>
                                );
                            }
                            if (claimedByOther) {
                                return (
                                    <div className="flex items-center gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 pr-2 pl-4 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                                            <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                            Diselesaikan oleh <span className="font-bold ml-1">{claimerName}</span>
                                        </span>
                                        {/* Admin Override */}
                                        {isAdmin && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => updateStatus('open')}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 h-7 text-xs px-2"
                                            >
                                                Force Release
                                            </Button>
                                        )}
                                    </div>
                                );
                            }
                            if (isAdmin) {
                                return (
                                    <Button
                                        variant="outline"
                                        onClick={() => updateStatus('open')}
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:bg-slate-900 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                    >
                                        Force Release (Admin)
                                    </Button>
                                );
                            }
                        }
                    })()}

                    <Button variant="ghost" onClick={onClose} className="hover:bg-slate-100">
                        Tutup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
