"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

interface Notification {
    id: string; // Unique ID for the notification itself
    ticket_id: number;
    message: string;
    created_at: string;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const pathname = usePathname();

    // Derived state
    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        // 1. Subscribe to Realtime Changes
        const channel = supabase
            .channel("realtime-tickets")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "tickets" },
                (payload) => {
                    // Play Sound
                    const audio = new Audio("/sounds/notification.mp3"); // Ensure this file exists or use a CDN
                    audio.play().catch(e => console.log("Audio play blocked", e));

                    const newTicket = payload.new;
                    const newNotification: Notification = {
                        id: crypto.randomUUID(),
                        ticket_id: newTicket.id,
                        message: `Yeni Talep: ${newTicket.summary || "Konu Yok"} (${newTicket.citizen_name})`,
                        created_at: new Date().toISOString(),
                        read: false,
                    };

                    setNotifications((prev) => [newNotification, ...prev]);
                    toast.info("Yeni başvuru geldi!", {
                        description: newNotification.message,
                        duration: 5000,
                        action: {
                            label: "Görüntüle",
                            onClick: () => window.location.href = `/tickets/${newTicket.id}`
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
