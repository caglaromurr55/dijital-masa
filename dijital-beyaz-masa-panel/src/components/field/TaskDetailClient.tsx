"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EvidenceUploader from "@/components/field/EvidenceUploader";
import { updateTicketStatus, resolveTicket, saveTicketEvidence } from "@/actions/tickets";
import { toast } from "sonner";
import { MapPin, Navigation, CheckCircle2, Play, ChevronLeft, Phone, User, Info, Camera } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const FieldMap = dynamic(() => import("@/components/map/LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-56 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />
});

interface TaskDetailClientProps {
    ticket: any;
}

export default function TaskDetailClient({ ticket }: TaskDetailClientProps) {
    const router = useRouter();
    const [status, setStatus] = useState(ticket.status);
    const [evidenceUrl, setEvidenceUrl] = useState<string | null>(ticket.media_url);
    const [loading, setLoading] = useState(false);

    const position: [number, number] = ticket.latitude && ticket.longitude
        ? [ticket.latitude, ticket.longitude]
        : [39.9334, 32.8597];

    const handleStart = async () => {
        setLoading(true);
        const res = await updateTicketStatus(ticket.id, "in_progress");
        if (res.error) {
            toast.error(res.error);
        } else {
            setStatus("in_progress");
            toast.success("Görev başlatıldı! Kolay gelsin. 🏗️");
        }
        setLoading(false);
    };

    const handleResolve = async () => {
        if (!evidenceUrl) {
            if (!confirm("Fotoğraf yüklemeden tamamlamak istediğinize emin misiniz?")) return;
        }

        setLoading(true);
        const res = await resolveTicket(ticket.id, evidenceUrl);
        if (res.error) {
            toast.error(res.error);
        } else {
            setStatus("resolved");
            toast.success("Harikasın! Bir problemi daha çözdün. 🌟");
            router.push("/field/tasks");
        }
        setLoading(false);
    };

    const openNavigation = () => {
        if (ticket.latitude && ticket.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${ticket.latitude},${ticket.longitude}`, '_blank');
        } else {
            toast.error("Konum bilgisi yok.");
        }
    };

    return (
        <div className="pb-32 space-y-6 animate-in fade-in duration-700">
            {/* Navbar with Back */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/field/tasks" className="h-12 w-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-90 transition-transform">
                    <ChevronLeft size={24} className="text-slate-600 dark:text-slate-400" />
                </Link>
                <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GÖREV DETAYI</p>
                    <h1 className="font-black text-xl leading-tight truncate text-slate-900 dark:text-slate-100 tracking-tight">#{ticket.id} {ticket.summary}</h1>
                </div>
            </div>

            {/* Map Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="h-64 w-full z-0 grayscale-[0.2] contrast-[1.1]">
                    <FieldMap
                        center={position}
                        zoom={15}
                        markers={ticket.latitude && ticket.longitude ? [{
                            id: ticket.id,
                            lat: ticket.latitude,
                            lng: ticket.longitude,
                            title: ticket.summary
                        }] : []}
                    />
                </div>
                {ticket.latitude && (
                    <div className="absolute top-4 right-4 z-[1000]">
                        <button
                            onClick={openNavigation}
                            className="bg-blue-600 text-white h-12 px-6 rounded-2xl shadow-xl shadow-blue-600/30 flex items-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
                        >
                            <Navigation size={18} fill="currentColor" />
                            YOL TARİFİ
                        </button>
                    </div>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4">
                {/* Description Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-800/50 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <Info size={18} className="text-blue-600" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Açıklama</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {ticket.description || "Talebe ait detaylı açıklama bulunmamaktadır."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">VATANDAŞ</span>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <User size={12} className="text-slate-500" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{ticket.citizen_name}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">İLETİŞİM</span>
                            <a href={`tel:${ticket.citizen_phone}`} className="flex items-center gap-2 group">
                                <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-active:scale-90 transition-transform">
                                    <Phone size={12} className="text-blue-600" />
                                </div>
                                <span className="text-sm font-bold text-blue-600 underline underline-offset-4">{ticket.citizen_phone}</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Evidence Upload Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-800/50 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                                <Camera size={18} className="text-purple-600" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Çözüm Kanıtı</h3>
                        </div>
                        {evidenceUrl && (
                            <Badge className="bg-green-500/10 text-green-600 border-none px-3 font-black text-[10px]">FOTOĞRAF YÜKLENDİ</Badge>
                        )}
                    </div>

                    <EvidenceUploader
                        ticketId={ticket.id}
                        onUploadComplete={async (url) => {
                            setEvidenceUrl(url);
                            if (url) {
                                await saveTicketEvidence(ticket.id, url);
                                toast.success("Fotoğraf kaydedildi ve göreve eklendi.");
                            }
                        }}
                        initialUrl={evidenceUrl}
                    />
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-32 left-4 right-4 z-[100] animate-in slide-in-from-bottom-20 duration-1000">
                {(status === "open" || status === "new") && (
                    <Button
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-20 rounded-[2rem] shadow-2xl shadow-blue-600/30 text-xl font-black gap-4 transition-all hover:scale-[1.02] active:scale-95"
                        onClick={handleStart}
                        disabled={loading}
                    >
                        <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Play fill="currentColor" size={24} />
                        </div>
                        İŞE BAŞLA
                    </Button>
                )}

                {status === "in_progress" && (
                    <Button
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-20 rounded-[2rem] shadow-2xl shadow-green-600/30 text-xl font-black gap-4 transition-all hover:scale-[1.02] active:scale-95"
                        onClick={handleResolve}
                        disabled={loading}
                    >
                        <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 size={24} />
                        </div>
                        GÖREVİ TAMAMLA
                    </Button>
                )}

                {status === "resolved" && (
                    <div className="w-full h-20 bg-slate-900/95 dark:bg-slate-900/90 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center font-black gap-3 shadow-2xl">
                        <div className="h-10 w-10 bg-green-500 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 size={24} />
                        </div>
                        BU GÖREV TAMAMLANDI
                    </div>
                )}
            </div>
        </div>
    );
}
