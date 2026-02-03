import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Ticket, MapPin, Calendar, Clock, AlertCircle } from "lucide-react";

interface TaskCardProps {
    ticket: any; // We'll infer type from detailed usage or import shared type later
}

export default function TaskCard({ ticket }: TaskCardProps) {
    const isUrgent = ticket.priority === "high" || ticket.priority === "critical";

    return (
        <Link href={`/field/tasks/${ticket.id}`} className="block">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:scale-95 transition-transform">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={isUrgent ? "destructive" : "secondary"} className="uppercase text-[10px]">
                        {ticket.priority || "Normal"}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">#{ticket.id}</span>
                </div>

                <h3 className="font-bold text-slate-800 mb-1 line-clamp-2">
                    {ticket.summary}
                </h3>

                <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                    {ticket.description || "Açıklama yok"}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(ticket.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                    {ticket.latitude && (
                        <div className="flex items-center gap-1 text-blue-500 font-medium">
                            <MapPin size={12} />
                            <span>Konumlu</span>
                        </div>
                    )}
                </div>

                {ticket.status === "in_progress" && (
                    <div className="mt-3 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded flex items-center justify-center gap-1 font-bold">
                        <Clock size={12} />
                        DEVAM EDİYOR
                    </div>
                )}
            </div>
        </Link>
    );
}
