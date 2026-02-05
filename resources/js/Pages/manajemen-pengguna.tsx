import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { UserPlus, Pencil, Trash2, User, Shield, Eye, EyeOff, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";

import { Skeleton } from "@/Components/ui/skeleton";

interface UserData {
    id: number;
    name: string;
    email: string;
    role: "admin" | "developer";
    created_at: string;
}

export function ManajemenPengguna() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "" });
        setIsEditing(false);
        setSelectedUser(null);
    };

    const fetchUsers = () => {
        setLoading(true);
        (window as any).axios.get('/api/dashboard/users')
            .then((res: any) => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch((err: any) => {
                console.error("Gagal load users", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = () => {
        if (!formData.name || !formData.email || (!isEditing && !formData.password)) {
            toast.error("Mohon lengkapi data");
            return;
        }

        const payload = { ...formData };

        if (isEditing && selectedUser) {
            (window as any).axios.put(`/api/dashboard/users/${selectedUser.id}`, payload)
                .then(() => {
                    toast.success("User berhasil diupdate");
                    fetchUsers();
                    setIsDialogOpen(false);
                    resetForm();
                })
                .catch((err: any) => toast.error("Gagal update user: " + err.response?.data?.message));
        } else {
            (window as any).axios.post('/api/dashboard/users', payload)
                .then(() => {
                    toast.success("Developer berhasil ditambahkan");
                    fetchUsers();
                    setIsDialogOpen(false);
                    resetForm();
                })
                .catch((err: any) => toast.error("Gagal tambah user: " + err.response?.data?.message));
        }
    };

    const handleEdit = (user: UserData) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "" // Blank for no change
        });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Yakin ingin menghapus user ini?")) {
            (window as any).axios.delete(`/api/dashboard/users/${id}`)
                .then(() => {
                    toast.success("User dihapus");
                    fetchUsers();
                })
                .catch((err: any) => toast.error("Gagal hapus: " + err.response?.data?.message));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Manajemen Pengguna"
                description="Kelola akun developer dan admin sistem."
                icon={Users}
            >
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-eris-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Akun
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow>
                                <TableHead className="w-[50px] text-center font-semibold text-slate-600">No</TableHead>
                                <TableHead className="font-semibold text-slate-600">Nama Pengguna</TableHead>
                                <TableHead className="font-semibold text-slate-600">Email</TableHead>
                                <TableHead className="font-semibold text-slate-600 text-center w-[120px]">Role</TableHead>
                                <TableHead className="font-semibold text-slate-600 w-[150px]">Bergabung Sejak</TableHead>
                                <TableHead className="text-right font-semibold text-slate-600 w-[100px] pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-6 w-[100px] mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        Belum ada pengguna terdaftar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user, index) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="text-center text-slate-500 font-mono text-xs">{index + 1}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="text-slate-900">{user.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{user.email}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={user.role === 'admin'
                                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50'
                                                : 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-50'
                                            }>
                                                {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                                                {user.role === 'admin' ? 'Administrator' : 'Developer'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit User' : 'Tambah Developer Baru'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Ubah informasi pengguna.' : 'User baru akan otomatis memiliki role Developer.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama Lengkap</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{isEditing ? 'Password Baru (Opsional)' : 'Password'}</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isEditing ? "Biarkan kosong jika tidak berubah" : "Minimal 8 karakter"}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700">Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
