"use client";

import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const router = useRouter();

    const handleNotificationClick = (id: string, ticketId: number) => {
        markAsRead(id);
        router.push(`/tickets/${ticketId}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl h-10 w-10 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Bell size={20} className={unreadCount > 0 ? "animate-pulse-slow" : ""} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-950 animate-bounce" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-[1.5rem] p-2 border-slate-100 dark:border-slate-800 shadow-xl">
                <DropdownMenuLabel className="flex justify-between items-center px-4 py-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Bildirimler ({unreadCount})</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 text-[10px] text-blue-500 font-bold hover:bg-blue-50">
                            Tümünü Okundu Say
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/50" />

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                            <Bell size={24} className="opacity-20" />
                            <span className="text-xs font-medium">Bildirim yok</span>
                        </div>
                    ) : (
                        <div className="space-y-1 p-1">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.id, notification.ticket_id)}
                                    className={`relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer transition-colors ${notification.read
                                            ? "hover:bg-slate-50 dark:hover:bg-slate-900/50 opacity-60"
                                            : "bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`text-sm leading-tight ${!notification.read ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-400"}`}>
                                            {notification.message}
                                        </p>
                                        {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {new Date(notification.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
