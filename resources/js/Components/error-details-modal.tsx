import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Copy, CheckCircle2, Clock, AlertTriangle, XCircle, Shield, Server, Terminal, Lock } from "lucide-react";
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
    const isLocked = error.status === 'in_progress' &&
        error.inProgressBy &&
        currentUser &&
        String(error.inProgressBy.id) !== String(currentUser.id);

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
            case "critical": return "bg-red-500 hover:bg-red-600";
            case "error": return "bg-orange-500 hover:bg-orange-600";
            case "warning": return "bg-yellow-500 hover:bg-yellow-600";
            default: return "bg-gray-500";
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "critical": return <XCircle className="w-5 h-5" />;
            case "error": return <AlertTriangle className="w-5 h-5" />;
            case "warning": return <AlertTriangle className="w-5 h-5" />;
            default: return <AlertTriangle className="w-5 h-5" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <Badge className={`${getSeverityColor(error.severity)} text-white border-0 px-3 py-1 flex gap-1 items-center`}>
                            {getSeverityIcon(error.severity)}
                            {error.severity.toUpperCase()}
                        </Badge>
                        <DialogTitle className="text-lg font-mono text-gray-700">{error.id}</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Waktu Kejadian</label>
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {error.timestamp.toLocaleString('en-US', {
                                    dateStyle: 'full',
                                    timeStyle: 'medium'
                                })}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Status & Penanggung Jawab</label>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                    {error.status === 'resolved' ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Resolved
                                        </Badge>
                                    ) : error.status === 'in_progress' ? (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            On Progress
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                            Open
                                        </Badge>
                                    )}
                                </div>
                                {error.status === 'in_progress' && (
                                    <span className="text-xs text-blue-600 font-medium mt-1">
                                        Dikerjakan oleh: {error.inProgressBy?.name || error.inProgressBy?.email || "User"}
                                    </span>
                                )}
                                {error.status === 'resolved' && (
                                    <span className="text-xs text-green-600 font-medium mt-1">
                                        Diselesaikan oleh: {error.resolvedBy?.name || error.resolvedBy?.email || "User"}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Aplikasi / Service</label>
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                <Server className="w-4 h-4 text-gray-400" />
                                {error.service}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Error Code</label>
                            <div className="flex items-center gap-2 text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded w-fit">
                                {error.errorCode}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Pesan Error</label>
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-900 text-sm font-medium">
                            {error.message}
                        </div>
                    </div>

                    {error.stackTrace && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Terminal className="w-4 h-4" /> Stack Trace
                                </label>
                                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleCopy(error.stackTrace!)}>
                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                </Button>
                            </div>
                            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto font-mono leading-relaxed">
                                {error.stackTrace}
                            </pre>
                        </div>
                    )}

                    {error.metadata && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Metadata</label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(error.metadata).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-2 rounded border border-gray-100 flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">{key}</span>
                                        <span className="text-sm font-mono text-gray-700 truncate" title={String(value)}>{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-100 flex justify-end gap-2">
                    {/* Action Buttons based on Status */}
                    {/* Action Buttons: Only show if Developer */}
                    {currentUser?.role === 'developer' ? (
                        <>
                            {error.status === 'open' && (
                                <Button
                                    onClick={() => updateStatus('in_progress')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    Ambil (Claim)
                                </Button>
                            )}

                            {error.status === 'in_progress' && (
                                <div className="flex gap-2 items-center">
                                    {isLocked && (
                                        <span className="text-xs text-red-500 font-medium mr-2 flex items-center">
                                            <Lock className="w-3 h-3 inline mr-1" />
                                            Locked by {error.inProgressBy?.name}
                                        </span>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => updateStatus('open')}
                                        disabled={isLocked}
                                        className={`text-gray-600 border-gray-300 hover:bg-gray-100 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Kembalikan ke Open
                                    </Button>
                                    <Button
                                        onClick={() => updateStatus('resolved')}
                                        disabled={isLocked}
                                        className={`bg-green-600 hover:bg-green-700 text-white gap-2 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Tandai Selesai (Resolve)
                                    </Button>
                                </div>
                            )}

                            {error.status === 'resolved' && (
                                <Button
                                    variant="outline"
                                    onClick={() => updateStatus('in_progress')}
                                    className="text-gray-600 border-gray-300 hover:bg-gray-100"
                                >
                                    Buka Kembali (Re-open)
                                </Button>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-500 text-sm italic py-2 px-4 self-center">
                            View Only (Admin)
                        </span>
                    )}

                    <Button variant="ghost" onClick={onClose}>
                        Tutup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
