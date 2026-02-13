import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { UserPlus, Pencil, Trash2, Shield, Eye, EyeOff, Users, Terminal } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";

import { Skeleton } from "@/Components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";

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
            toast.error("Please complete the data");
            return;
        }

        const payload = { ...formData };

        if (isEditing && selectedUser) {
            (window as any).axios.put(`/api/dashboard/users/${selectedUser.id}`, payload)
                .then(() => {
                    toast.success("User successfully updated");
                    fetchUsers();
                    setIsDialogOpen(false);
                    resetForm();
                })
                .catch((err: any) => toast.error("Failed to update user: " + err.response?.data?.message));
        } else {
            (window as any).axios.post('/api/dashboard/users', payload)
                .then(() => {
                    toast.success("Developer successfully added");
                    fetchUsers();
                    setIsDialogOpen(false);
                    resetForm();
                })
                .catch((err: any) => toast.error("Failed to add user: " + err.response?.data?.message));
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
        if (confirm("Are you sure you want to delete this user?")) {
            (window as any).axios.delete(`/api/dashboard/users/${id}`)
                .then(() => {
                    toast.success("User deleted");
                    fetchUsers();
                })
                .catch((err: any) => toast.error("Failed to delete: " + err.response?.data?.message));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="User Management"
                description="Manage developer and system admin accounts."
                icon={Users}
            >
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-eris-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Account
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>User List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <TableRow>
                                <TableHead className="w-[50px] text-center font-semibold text-slate-600 dark:text-slate-300">No</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Username</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Email</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center w-[120px]">Role</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 w-[150px]">Joined Since</TableHead>
                                <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300 w-[100px] pr-6">Action</TableHead>
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
                                        No users registered yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user, index) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800">
                                        <TableCell className="text-center text-slate-500 dark:text-slate-400 font-mono text-xs">{index + 1}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt={user.name} />
                                                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-slate-900 dark:text-slate-100">{user.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{user.email}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={user.role === 'admin'
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                                : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
                                            }>
                                                {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <Terminal className="w-3 h-3 mr-1" />}
                                                {user.role === 'admin' ? 'Administrator' : 'Developer'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs">
                                            {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg transition-colors"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg transition-colors"
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
                        <DialogTitle>{isEditing ? 'Edit User' : 'Add New Developer'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update user information.' : 'New users will automatically have Developer role.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: John Doe"
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
                            <Label>{isEditing ? 'New Password (Optional)' : 'Password'}</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isEditing ? "Leave blank if unchanged" : "Minimum 8 characters"}
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
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900 border-slate-200 dark:border-slate-700">Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:text-white">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
