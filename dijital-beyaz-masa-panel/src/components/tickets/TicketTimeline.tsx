import {
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
    id: number;
    created_at: string;
    description: string;
    user?: {
        full_name: string;
    };
}

interface TicketTimelineProps {
    logs: any[];
    ticketCreatedAt: string;
}

export default function TicketTimeline({ logs, ticketCreatedAt }: TicketTimelineProps) {
    // Combine creation event with logs
    const events = [
        ...logs.map(log => ({
            id: log.id,
            date: log.created_at,
            title: log.action_type === 'TICKET_UPDATE' ? 'Durum Güncellemesi' : 'İşlem',
            description: log.description,
            user: log.profiles?.full_name || 'Sistem',
            icon: <Clock className="w-4 h-4 text-blue-500" />
        })),
        {
            id: 0,
            date: ticketCreatedAt,
            title: "Talep Oluşturuldu",
            description: "Vatandaş tarafından yeni talep açıldı.",
            user: "Vatandaş",
            icon: <AlertCircle className="w-4 h-4 text-green-500" />
        }
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8">
            {events.map((event, index) => (
                <div key={event.id} className="relative flex gap-6 group">
                    {/* Vertical Line */}
                    {index !== events.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-[-32px] w-0.5 bg-slate-100 dark:bg-slate-800 group-last:hidden" />
                    )}

                    <div className="relative z-10 hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                        {event.icon}
                    </div>

                    <div className="flex-1 space-y-1 pt-1.5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{event.title}</h3>
                            <time className="text-[10px] uppercase font-bold text-slate-400">
                                {new Date(event.date).toLocaleString('tr-TR')}
                            </time>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            {event.description}
                        </p>
                        <p className="text-xs text-slate-400 font-medium px-1">
                            İşlem Yapan: <span className="text-slate-700 dark:text-slate-200">{event.user}</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
