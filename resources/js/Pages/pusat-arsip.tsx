import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { FileSpreadsheet, Download, Archive, Calendar } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";

interface ArchiveData {
    id: number;
    periode: string; // "Triwulan I 2026"
    year: number;
    generated_at: string;
}

export function PusatArsip() {
    const [archives, setArchives] = useState<ArchiveData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArchives();
    }, []);

    const fetchArchives = () => {
        setLoading(true);
        (window as any).axios.get('/api/dashboard/archives')
            .then((res: any) => {
                setArchives(res.data);
                setLoading(false);
            })
            .catch((err: any) => {
                console.error("Gagal memuat arsip", err);
                toast.error("Gagal memuat data arsip");
                setLoading(false);
            });
    };

    const handleDownload = (id: number, type: 'pdf' | 'excel') => {
        // Use window.open or a hidden link to trigger download
        const url = `/api/dashboard/archives/download/${id}/${type}`;
        window.open(url, '_blank');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Pusat Arsip & Retensi Data"
                description="Repositori laporan historis dan data mentah triwulanan."
                icon={Archive}
            />

            <Card className="border-cyan-100 bg-cyan-50/50">
                <div className="p-6 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg border border-cyan-100 shadow-sm">
                        <Archive className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-cyan-900 mb-1">Strategi Retensi Data (3 Bulan)</h3>
                        <p className="text-sm text-cyan-700/80 leading-relaxed max-w-3xl">
                            Untuk menjaga performa sistem tetap optimal, data log aktif ("Live Data") dibatasi hanya untuk periode
                            <strong> 3 bulan terakhir</strong>. Data yang lebih lama secara otomatis diarsipkan ke dalam format PDF dan Excel di halaman ini.
                        </p>
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        Daftar Arsip Triwulan
                    </CardTitle>
                    <CardDescription>
                        Unduh laporan analitik strategis atau raw data untuk keperluan audit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="w-[30%]">Periode Laporan</TableHead>
                                    <TableHead>Waktu Generate</TableHead>
                                    <TableHead className="text-right">File Arsip (Raw Data)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                            Memuat data arsip...
                                        </TableCell>
                                    </TableRow>
                                ) : archives.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                    <Archive className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <div className="text-slate-900 font-medium">Belum ada arsip tersedia</div>
                                                <p className="text-slate-500 text-sm max-w-xs">
                                                    Data arsip log lama akan muncul di sini.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    archives.map((archive) => (
                                        <TableRow key={archive.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-medium text-slate-900 text-base">
                                                {archive.periode}
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm font-mono">
                                                {formatDate(archive.generated_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Mock file size since backend doesn't send it yet */}
                                                    <span className="text-xs text-gray-400 font-mono">{(Math.random() * (5 - 0.5) + 0.5).toFixed(2)} MB</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2 text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200 shadow-sm hover:shadow transition-all"
                                                        onClick={() => handleDownload(archive.id, 'excel')}
                                                    >
                                                        <FileSpreadsheet className="w-4 h-4" />
                                                        Download Excel
                                                        <Download className="w-3 h-3 ml-1 opacity-50" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
