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
        <div className="flex h-screen overflow-hidden bg-eris-bg-light">
            <Toaster position="bottom-right" richColors />

            <div className="flex-shrink-0 h-full overflow-y-auto border-r border-slate-800 bg-eris-slate-950">
                <Sidebar
                    criticalCount={criticalCount}
                    userRole={userRole}
                    user={currentUser}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <TopBar
                    criticalErrors={criticalErrors}
                    onMarkAsRead={onMarkAsRead}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onLogout={onLogout}
                />

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto pb-10">
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
