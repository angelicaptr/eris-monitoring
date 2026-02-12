import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";
import { Plus, Eye, EyeOff, Copy, Terminal, AlertCircle, Pencil, Trash2, Grid } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";
import { Skeleton } from "@/Components/ui/skeleton";
import { MultiSelect, Option } from "@/Components/ui/multi-select";
import { AvatarStack } from "@/Components/ui/avatar-stack";

import { TooltipProvider } from "@/Components/ui/tooltip";

export function ManajemenAplikasi({ user }: { user: any }) {

    const [apps, setApps] = useState<any[]>([]);
    const [developers, setDevelopers] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [visibleKeyId, setVisibleKeyId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        app_name: "",
        description: "",
        developers: [] as string[]
    });

    useEffect(() => {
        fetchApps();
        fetchDevelopers();
    }, []);

    const fetchDevelopers = () => {
        (window as any).axios.get('/api/users/developers')
            .then((res: any) => {
                const options = res.data.map((dev: any) => ({
                    label: dev.name,
                    value: String(dev.id),
                    icon: null
                }));
                setDevelopers(options);
            })
            .catch((err: any) => {
                console.error("Gagal memuat developer", err);
            });
    }

    const fetchApps = () => {
        setLoading(true);
        (window as any).axios.get('/api/dashboard/apps')
            .then((res: any) => {
                setApps(res.data);
                setLoading(false);
            })
            .catch((err: any) => {
                console.error("Gagal memuat aplikasi", err);
                toast.error("Gagal memuat daftar aplikasi");
                setLoading(false);
            });
    };

    const resetForm = () => {
        setFormData({
            app_name: "",
            description: "",
            developers: []
        });
        setSelectedApp(null);
    };

    const handleCreate = () => {
        if (!formData.app_name) {
            toast.error("Nama aplikasi wajib diisi");
            return;
        }

        (window as any).axios.post('/api/dashboard/apps', formData)
            .then(() => {
                toast.success("Aplikasi berhasil ditambahkan");
                setIsCreateOpen(false);
                fetchApps();
                resetForm();
            })
            .catch((err: any) => {
                toast.error(err.response?.data?.message || "Gagal menambah aplikasi");
            });
    };

    const handleEditOpen = (app: any) => {
        setSelectedApp(app);
        setFormData({
            app_name: app.app_name,
            description: app.description || "",
            developers: app.developers ? app.developers.map((d: any) => String(d.id)) : []
        });
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedApp) return;

        (window as any).axios.put(`/api/dashboard/apps/${selectedApp.id}`, formData)
            .then(() => {
                toast.success("Aplikasi berhasil diperbarui");
                setIsEditOpen(false);
                fetchApps();
                resetForm();
            })
            .catch((err: any) => {
                toast.error(err.response?.data?.message || "Gagal memperbarui aplikasi");
            });
    };

    const handleDeleteOpen = (app: any) => {
        setSelectedApp(app);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!selectedApp) return;

        (window as any).axios.delete(`/api/dashboard/apps/${selectedApp.id}`)
            .then(() => {
                toast.success("Aplikasi berhasil dihapus");
                setIsDeleteOpen(false);
                fetchApps();
                resetForm();
            })
            .catch((err: any) => {
                toast.error(err.response?.data?.message || "Gagal menghapus aplikasi");
            });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("API Key disalin ke clipboard");
    };

    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {/* Left Column: App List */}
                <div className="lg:col-span-2 space-y-6">
                    <PageHeader
                        title="Manajemen Aplikasi"
                        description="Daftarkan dan kelola akses aplikasi yang dimonitor."
                        icon={Grid}
                        titleClassName="dark:text-white"
                        descriptionClassName="dark:text-slate-400"
                    >
                        {(user?.role === 'admin') && (
                            <Button className="bg-eris-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Aplikasi
                            </Button>
                        )}
                    </PageHeader>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <TableRow>
                                        <TableHead className="w-[50px] text-center font-semibold text-slate-600 dark:text-slate-300">No</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300 min-w-[200px]">Aplikasi</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300 min-w-[120px]">Tim Developer</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300">API Key</TableHead>
                                        <TableHead className="font-semibold text-slate-600 dark:text-slate-300 w-[100px] text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-3 w-[100px] mt-2" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : apps.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                                {user?.role === 'admin' ? "Belum ada aplikasi terdaftar." : "Anda belum ditugaskan ke aplikasi mana pun."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        apps.map((app, index) => (
                                            <TableRow key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800">
                                                <TableCell className="text-center text-slate-500 dark:text-slate-400 font-mono text-xs">{index + 1}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-slate-900 dark:text-slate-100">{app.app_name}</div>
                                                    {app.description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-[200px]">{app.description}</div>}
                                                </TableCell>
                                                <TableCell>
                                                    <AvatarStack users={app.developers} limit={3} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative group">
                                                            <code className="text-[11px] bg-slate-100 dark:bg-slate-950 px-2 py-1.5 rounded font-mono border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 inline-block min-w-[180px] max-w-[180px] truncate transition-colors">
                                                                {visibleKeyId === app.id ? app.api_key : "•".repeat(32)}
                                                            </code>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-slate-400 hover:text-eris-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 shrink-0 transition-colors"
                                                            onClick={() => setVisibleKeyId(visibleKeyId === app.id ? null : app.id)}
                                                        >
                                                            {visibleKeyId === app.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 shrink-0 transition-colors"
                                                            onClick={() => copyToClipboard(app.api_key)}
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-1">
                                                        {/* Using the user prop here guarantees we have the role info */}
                                                        {(user?.role === 'admin' || (user && app.user_id === user.id)) && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 rounded-lg"
                                                                    onClick={() => handleEditOpen(app)}
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 rounded-lg"
                                                                    onClick={() => handleDeleteOpen(app)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Creation Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Tambah Aplikasi Baru</DialogTitle>
                            <DialogDescription>
                                Daftarkan aplikasi baru untuk mendapatkan API Key unik.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="app_name">Nama Aplikasi <span className="text-red-500">*</span></Label>
                                <Input
                                    id="app_name"
                                    placeholder="Contoh: Sistem Keuangan"
                                    value={formData.app_name}
                                    onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Deskripsi</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Keterangan singkat aplikasi..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tim Developer</Label>
                                <MultiSelect
                                    options={developers}
                                    selected={formData.developers}
                                    onChange={(selected) => setFormData({ ...formData, developers: selected })}
                                    placeholder="Pilih developer..."
                                />
                                <p className="text-[11px] text-slate-400">Developer yang dipilih akan memiliki akses penuh ke log aplikasi ini.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900 border-slate-200 dark:border-slate-700">Batal</Button>
                            <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:text-white">Simpan Aplikasi</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Aplikasi</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi aplikasi.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_app_name">Nama Aplikasi <span className="text-red-500">*</span></Label>
                                <Input
                                    id="edit_app_name"
                                    value={formData.app_name}
                                    onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_desc">Deskripsi</Label>
                                <Textarea
                                    id="edit_desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tim Developer</Label>
                                <MultiSelect
                                    options={developers}
                                    selected={formData.developers}
                                    onChange={(selected) => setFormData({ ...formData, developers: selected })}
                                    placeholder="kelola tim..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900 border-slate-200 dark:border-slate-700">Batal</Button>
                            <Button onClick={handleUpdate} className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:text-white">Simpan Perubahan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Hapus Aplikasi?
                            </DialogTitle>
                            <DialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Semua log error yang terkait dengan aplikasi <strong>{selectedApp?.app_name}</strong> juga akan dihapus permanen.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900 border-slate-200 dark:border-slate-700">Batal</Button>
                            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Ya, Hapus Permanen</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Right Column: Integration Guide */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-slate-800 sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-cyan-500" />
                                Panduan Integrasi Cepat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Endpoint URL</Label>
                                <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-xs text-cyan-400 break-all">
                                    http://localhost:8000/api/logs
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Header Wajib</Label>
                                <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-orange-400">Content-Type:</span>
                                        <span className="text-slate-400">application/json</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-orange-400">X-API-KEY:</span>
                                        <span className="text-slate-400">YOUR_API_KEY</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Contoh Body JSON</Label>
                                <pre className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-green-400 overflow-x-auto">
                                    {`{
  "message": "Error details...",
  "severity": "critical",
  "stack_trace": "...",
  "metadata": {}
}`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    );
}
