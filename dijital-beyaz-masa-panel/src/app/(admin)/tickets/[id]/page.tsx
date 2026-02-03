import { getTicketById } from "@/actions/tickets";
import TicketTimeline from "@/components/tickets/TicketTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Phone, User, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserSelect from "@/components/admin/UserSelect";

export const dynamic = 'force-dynamic';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) return notFound();

    const { ticket, logs, error } = await getTicketById(numericId);

    if (error || !ticket) {
        return <div className="p-8 text-center text-red-500">Talep bulunamadı veya bir hata oluştu.</div>;
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "new": return <Badge className="bg-red-50 text-red-600 border-red-100 font-bold px-3 py-1">Yeni</Badge>;
            case "in_progress": return <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-bold px-3 py-1">İşlemde</Badge>;
            case "resolved": return <Badge className="bg-green-50 text-green-600 border-green-100 font-bold px-3 py-1">Çözüldü</Badge>;
            default: return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-3 py-1">Bilinmiyor</Badge>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* BAŞLIK VE GERİ BUTONU */}
            <div className="flex items-center gap-4">
                <Link href="/tickets">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <ChevronLeft size={18} />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Talep #{ticket.id}</h1>
                        {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Detaylı talep bilgileri ve işlem geçmişi.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* SOL: DETAYLAR */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <Tag className="text-blue-500" size={20} /> Talep Özeti
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-lg">
                                {ticket.summary}
                            </p>

                            {/* SAHA EKİBİ ATAMA */}
                            <div className="flex items-center gap-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-700 dark:text-yellow-500">
                                    <User size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">Saha Ekibi Atama</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Bu görevi bir personele ata.</p>
                                    <UserSelect ticketId={ticket.id} currentAssigneeId={ticket.assigned_to} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vatandaş</p>
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
                                    <User size={16} className="text-blue-500" /> {ticket.citizen_name}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefon</p>
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
                                    <Phone size={16} className="text-green-500" /> {ticket.citizen_phone}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Oluşturulma Tarihi</p>
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
                                    <Calendar size={16} className="text-purple-500" /> {new Date(ticket.created_at).toLocaleDateString("tr-TR")}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Konum</p>
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
                                    <MapPin size={16} className="text-red-500" /> {ticket.location || "Belirtilmemiş"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAĞ: ZAMAN ÇİZELGESİ */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">İşlem Geçmişi</h2>
                        <TicketTimeline logs={logs || []} ticketCreatedAt={ticket.created_at} />
                    </div>
                </div>

            </div>
        </div>
    );
}
