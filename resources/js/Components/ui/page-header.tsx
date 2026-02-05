import { LucideIcon } from "lucide-react";
import { cn } from "@/Components/ui/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string; // e.g. "text-cyan-600", "text-blue-600"
    iconBgColor?: string; // e.g. "bg-cyan-50", "bg-blue-50"
    children?: React.ReactNode; // For actions/buttons on the right
    className?: string;
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    iconColor = "text-eris-indigo-600",
    iconBgColor = "bg-indigo-50",
    children,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6", className)}>
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className={cn("p-3 rounded-xl flex items-center justify-center shrink-0 border border-transparent shadow-sm", iconBgColor)}>
                        <Icon className={cn("w-6 h-6", iconColor)} />
                    </div>
                )}
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-eris-indigo-600 leading-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-slate-500 font-medium tracking-wide max-w-2xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {children && (
                <div className="flex items-center gap-3 shrink-0">
                    {children}
                </div>
            )}
        </div>
    );
}
