import { useState, useEffect } from "react";
import { Card } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import { AlertCircle, Mail, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/Components/ui/page-header";
import { toast } from "sonner";


export function KonfigurasiEmail() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial state
  useEffect(() => {
    (window as any).axios.get('/api/dashboard/settings')
      .then((res: any) => {
        // API returns { "email_notifications_enabled": "true" }
        const isEnabled = res.data.email_notifications_enabled === 'true';
        setEnabled(isEnabled);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Gagal load settings", err);
        toast.error("Gagal memuat konfigurasi email.");
        setLoading(false);
      });
  }, []);

  const handleToggle = (checked: boolean) => {
    // Optimistic update
    setEnabled(checked);

    (window as any).axios.put('/api/dashboard/settings', {
      email_notifications_enabled: checked
    })
      .then(() => {
        toast.success(checked ? "Notifikasi Email Diaktifkan" : "Notifikasi Email Dinonaktifkan");
      })
      .catch((err: any) => {
        // Revert on failure
        setEnabled(!checked);
        toast.error("Gagal menyimpan konfigurasi.");
        console.error(err);
      });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Konfigurasi Email"
        description="Pusat kontrol notifikasi email aplikasi."
        icon={Mail}
      />

      <div className="max-w-2xl">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Master Switch Notifikasi
                {enabled ? (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">Aktif</span>
                ) : (
                  <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700">Nonaktif</span>
                )}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Matikan atau hidupkan seluruh pengiriman email notifikasi dari sistem ini.
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={loading}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className={`p-4 rounded-lg border transition-colors duration-300 ${enabled ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-gray-50 border-gray-100 dark:bg-slate-900/50 dark:border-slate-800'}`}>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-400'}`} />
              Bagaimana ini bekerja?
            </h4>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-slate-400 ml-6 list-disc">
              <li>
                Jika <strong>Aktif</strong>: Sistem akan mengirim email ke seluruh user dengan role <span className="font-mono text-xs bg-gray-200 dark:bg-slate-800 px-1 rounded">developer</span> ketika terjadi error dengan level <span className="font-bold text-red-600 dark:text-red-400">CRITICAL</span>.
              </li>
              <li>
                Jika <strong>Nonaktif</strong>: Tidak ada email yang akan dikirim sama sekali, meskipun terjadi error critical. Fitur ini berguna saat maintenance atau testing intensif untuk mencegah spam.
              </li>
            </ul>
          </div>

          {enabled && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-green-700 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Sistem siap mengirim notifikasi via Mailtrap
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
