import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip"

interface User {
    id: number
    name: string
    avatar_url?: string | null
    email?: string
}

interface AvatarStackProps {
    users: User[]
    limit?: number
    className?: string
}

export function AvatarStack({ users, limit = 3, className }: AvatarStackProps) {
    if (!users || users.length === 0) return <span className="text-slate-400 text-xs italic">Unassigned</span>

    const visibleUsers = users.slice(0, limit)
    const remaining = users.length - limit

    return (
        <div className={`flex items-center ${className}`}>
            <TooltipProvider>
                {visibleUsers.map((user, index) => (
                    <Tooltip key={user.id}>
                        <TooltipTrigger asChild>
                            <div
                                className={`relative inline-block -ml-3 first:ml-0 transition-transform hover:z-10 hover:scale-110 border-2 border-white rounded-full bg-slate-100`}
                                style={{ zIndex: users.length - index }}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt={user.name} />
                                    <AvatarFallback className="text-[10px]">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-semibold text-xs">{user.name}</p>
                            <p className="text-[10px] text-slate-400">{user.email}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>

            {remaining > 0 && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="relative flex items-center justify-center -ml-3 h-8 w-8 rounded-full border-2 border-white bg-slate-100 text-[10px] font-medium text-slate-600 hover:bg-slate-200 hover:z-10 z-0 cursor-default"
                        >
                            +{remaining}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="flex flex-col gap-1">
                            <p className="font-semibold text-xs border-b pb-1 mb-1">+{remaining} Lainnya</p>
                            {users.slice(limit).map((user) => (
                                <p key={user.id} className="text-xs">{user.name}</p>
                            ))}
                        </div>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    )
}
