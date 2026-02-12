import { useState, useEffect, useRef } from "react";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { User, Lock, Save, Loader2, Eye, EyeOff, Shield, Camera } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/Components/ui/page-header";

interface ProfilPenggunaProps {
  user: any;
}

export function ProfilPengguna({ user }: ProfilPenggunaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatRole = (role: string) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: formatRole(user?.role),
    avatar_url: user?.avatar_url || null
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.avatar_url || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Update local state if user prop changes
  useEffect(() => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      role: formatRole(user?.role),
      avatar_url: user?.avatar_url || null
    });
    setPhotoPreview(user?.avatar_url || null);
  }, [user]);

  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    (window as any).axios.put('/user/profile', {
      name: profileData.name,
      email: profileData.email
    })
      .then(() => {
        toast.success("Profil berhasil diperbarui!");
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Gagal memperbarui profil");
        console.error(err);
      })
      .finally(() => setIsProfileLoading(false));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }

    setIsPasswordLoading(true);
    (window as any).axios.put('/user/password', {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      new_password_confirmation: passwordData.confirmPassword
    })
      .then(() => {
        toast.success("Password berhasil diperbarui!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Gagal memperbarui password");
      })
      .finally(() => setIsPasswordLoading(false));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Build preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handlePhotoUpload(file);
  };

  const handlePhotoUpload = (file: File) => {
    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    (window as any).axios.post('/user/photo-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        toast.success("Foto profil berhasil diperbarui!");
        // TODO: Sync with global user state
      })
      .catch((err: any) => {
        console.error("Upload error", err);
        toast.error("Gagal mengupload foto");
        // Revert preview on error
        setPhotoPreview(user?.avatar_url || null);
      })
      .finally(() => setIsUploadingPhoto(false));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Profil Pengguna"
        description="Kelola informasi akun dan keamanan Anda."
        icon={Shield}
      />

      {/* Header Profile Card - Horizontal Layout */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-eris-indigo-600 to-purple-600"></div>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative group cursor-pointer" onClick={triggerFileInput}>
            <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white dark:border-slate-800 shadow-lg ring-2 ring-slate-100 dark:ring-slate-700 transition-all duration-300 group-hover:ring-eris-indigo-600">
              {photoPreview ? (
                <AvatarImage src={photoPreview} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-3xl bg-slate-900 dark:bg-slate-950 text-white font-bold">
                {profileData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Overlay for upload */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>

            {isUploadingPhoto && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePhotoSelect}
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profileData.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{profileData.email}</p>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
              <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-eris-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                {profileData.role}
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                Active
              </div>
            </div>
          </div>

          <div className="hidden md:block pr-8 border-l border-slate-100 dark:border-slate-800 pl-8">
            <div className="text-right space-y-1">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Member Since</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">January 2026</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Grid - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Profile Form */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Informasi Pribadi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Perbarui identitas akun anda</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5 flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={isProfileLoading}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Alamat Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={isProfileLoading}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Akses Role</Label>
                <div className="relative">
                  <Input
                    id="role"
                    value={profileData.role}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-slate-200 dark:border-slate-700 pl-9"
                  />
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-slate-400">
                  *Hubungi Administrator untuk perubahan hak akses.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-auto">
              <Button type="submit" disabled={isProfileLoading} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700 text-white">
                {isProfileLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {!isProfileLoading && <Save className="w-4 h-4 mr-2" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col bg-white dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Keamanan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lindungi akun dengan password kuat</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    disabled={isPasswordLoading}
                    placeholder="Masukan password lama..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      disabled={isPasswordLoading}
                      placeholder="Minimal 8 karakter"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      disabled={isPasswordLoading}
                      placeholder="Ulangi password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-auto">
              <Button type="submit" disabled={isPasswordLoading} variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-300">
                {isPasswordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {!isPasswordLoading && <Lock className="w-4 h-4 mr-2" />}
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
