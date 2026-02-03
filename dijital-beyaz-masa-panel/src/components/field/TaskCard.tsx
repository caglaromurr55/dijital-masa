"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, ChevronRight, AlertCircle } from "lucide-react";

interface TaskCardProps {
    ticket: any;
}

export default function TaskCard({ ticket }: TaskCardProps) {
    const isUrgent = ticket.priority === "high" || ticket.priority === "critical";
    const isInProgress = ticket.status === "in_progress";

    return (
        <Link href={`/field/tasks/${ticket.id}`} className="group block">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100/50 dark:border-slate-800/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group-active:scale-95 relative overflow-hidden">

                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 w-2 h-full ${isUrgent ? 'bg-red-500' : 'bg-blue-500'} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <Badge variant={isUrgent ? "destructive" : "secondary"} className="rounded-lg h-6 px-3 text-[10px] font-black uppercase tracking-widest border-none">
                            {ticket.priority || "Normal"}
                        </Badge>
                        {isInProgress && (
                            <Badge className="bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-none rounded-lg h-6 px-3 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                İŞLEMDE
                            </Badge>
                        )}
                    </div>
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 tracking-tighter">TASK #{ticket.id}</span>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors tracking-tight leading-tight">
                        {ticket.summary}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                        {ticket.description || "Talebe ait henüz bir açıklama girilmemiş."}
                    </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tight">
                            <Calendar size={14} className="text-blue-500" />
                            {new Date(ticket.created_at).toLocaleDateString("tr-TR")}
                        </div>
                        {ticket.latitude && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-tight">
                                <MapPin size={14} />
                                Konumlu
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
