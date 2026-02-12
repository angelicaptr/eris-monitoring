import { Sidebar } from "@/Components/sidebar";
import { TopBar } from "@/Components/top-bar";
import { Toaster } from "sonner";
import { ErrorDetailsModal } from "@/Components/error-details-modal";
import { ErrorLog } from "@/Components/error-table";

interface DashboardLayoutProps {
    children: React.ReactNode;
    criticalCount: number;
    userRole?: string;
    criticalErrors: any[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onLogout: () => void;
    selectedError?: ErrorLog | null;
    isModalOpen?: boolean;
    onCloseModal?: () => void;
    onUpdateError?: () => void;
    currentUser?: any;
}

export function DashboardLayout({
    children,
    criticalCount,
    userRole,
    criticalErrors,
    onMarkAsRead,
    onMarkAllAsRead,
    onLogout,
    selectedError,
    isModalOpen = false,
    onCloseModal = () => { },
    onUpdateError = () => { },
    currentUser
}: DashboardLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-eris-bg-light dark:bg-slate-950 text-slate-800 dark:text-slate-100 print:h-auto print:overflow-visible print:bg-white">
            <Toaster position="bottom-right" richColors />

            <div className="flex-shrink-0 h-full overflow-y-auto border-r border-slate-800 bg-eris-slate-950 dark:bg-slate-950 print:hidden">
                <Sidebar
                    criticalCount={criticalCount}
                    userRole={userRole}
                    user={currentUser}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible">
                <div className="print:hidden">
                    <TopBar
                        criticalErrors={criticalErrors}
                        onMarkAsRead={onMarkAsRead}
                        onMarkAllAsRead={onMarkAllAsRead}
                        onLogout={onLogout}
                    />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 relative print:overflow-visible print:h-auto print:p-0">
                    <div className="max-w-7xl mx-auto pb-10 print:max-w-none print:pb-0">
                        {children}
                    </div>
                </div>
            </div>

            <ErrorDetailsModal
                error={selectedError || null}
                open={isModalOpen}
                onClose={onCloseModal}
                onUpdate={onUpdateError}
                currentUser={currentUser}
            />
        </div>
    );
}
