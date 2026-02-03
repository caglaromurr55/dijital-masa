"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EvidenceUploader from "@/components/field/EvidenceUploader";
import { updateTicketStatus, resolveTicket } from "@/actions/tickets";
import { toast } from "sonner";
import { MapPin, Navigation, CheckCircle, Play, ChevronLeft } from "lucide-react";
import Link from "next/link";
// Dynamic import for map to avoid SSR issues
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Simple map component for detail view
const FieldMap = dynamic(() => import("@/components/map/LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl" />
});

interface TaskDetailClientProps {
    ticket: any;
}

export default function TaskDetailClient({ ticket }: TaskDetailClientProps) {
    const router = useRouter();
    const [status, setStatus] = useState(ticket.status);
    const [evidenceUrl, setEvidenceUrl] = useState<string | null>(ticket.media_url);
    const [loading, setLoading] = useState(false);

    // Derive coordinates or default (Ankara center)
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
            router.push("/field/tasks"); // Go back to list
        }
        setLoading(false);
    };

    const openNavigation = () => {
        if (ticket.latitude && ticket.longitude) {
            // Open Google Maps
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${ticket.latitude},${ticket.longitude}`, '_blank');
        } else {
            toast.error("Konum bilgisi yok.");
        }
    };

    return (
        <div className="pb-24">
            {/* Navbar with Back */}
            <div className="flex items-center gap-2 mb-4">
                <Link href="/field/tasks" className="p-2 bg-white rounded-full border shadow-sm">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <span className="text-xs text-slate-400 font-mono">#{ticket.id}</span>
                    <h1 className="font-bold text-lg leading-tight line-clamp-1">{ticket.summary}</h1>
                </div>
            </div>

            {/* Map Section */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 mb-6 bg-slate-100">
                <div className="h-48 w-full z-0">
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
                    <button
                        onClick={openNavigation}
                        className="absolute bottom-3 right-3 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold active:scale-95 transition-transform z-[1000]"
                    >
                        <Navigation size={16} />
                        Yol Tarifi
                    </button>
                )}
            </div>

            {/* Details Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Açıklama</h3>
                    <p className="text-slate-700 leading-relaxed">
                        {ticket.description || "Açıklama girilmemiş."}
                    </p>
                </div>

                <div className="flex gap-4 border-t border-slate-50 pt-4">
                    <div>
                        <span className="text-xs font-bold text-slate-400 block mb-1">VATANDAŞ</span>
                        <span className="text-sm font-medium">{ticket.citizen_name}</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-400 block mb-1">TELEFON</span>
                        <a href={`tel:${ticket.citizen_phone}`} className="text-sm font-medium text-blue-600 underline">
                            {ticket.citizen_phone}
                        </a>
                    </div>
                </div>

                {/* Evidence Section */}
                <div className="border-t border-slate-50 pt-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">📸 Çözüm Kanıtı</h3>
                    <EvidenceUploader ticketId={ticket.id} onUploadComplete={setEvidenceUrl} />
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-[100] flex gap-3 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
                {status === "open" && (
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg gap-2 h-14" onClick={handleStart} disabled={loading}>
                        <Play fill="currentColor" />
                        İşe Başla
                    </Button>
                )}

                {status === "in_progress" && (
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg gap-2 h-14" onClick={handleResolve} disabled={loading}>
                        <CheckCircle size={24} />
                        Tamamla
                    </Button>
                )}

                {status === "resolved" && (
                    <div className="w-full h-14 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center font-bold gap-2">
                        <CheckCircle size={20} />
                        Bu görev tamamlandı
                    </div>
                )}
            </div>
        </div>
    );
}
