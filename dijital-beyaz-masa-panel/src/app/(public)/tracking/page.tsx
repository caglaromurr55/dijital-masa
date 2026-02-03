"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, Clock, AlertCircle, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPublicTicketStatus } from "@/actions/tickets";
import { toast } from "sonner";
import Link from "next/link";

export default function TrackingPage() {
    const [ticketId, setTicketId] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId || !phone) {
            toast.error("Lütfen tüm alanları doldurun.");
            return;
        }

        setLoading(true);
        try {
            const result = await getPublicTicketStatus(ticketId, phone);
            if (result.error) {
                toast.error(result.error);
                setTicket(null);
            } else {
                setTicket(result.ticket);
                toast.success("Talep bulundu.");
            }
        } catch (error) {
            toast.error("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const configs: Record<string, { label: string, color: string, icon: any }> = {
            open: { label: "Açık", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <Clock className="w-4 h-4" /> },
            in_progress: { label: "İşlemde", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: <AlertCircle className="w-4 h-4" /> },
            resolved: { label: "Çözüldü", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle2 className="w-4 h-4" /> },
            cancelled: { label: "İptal", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400", icon: <AlertCircle className="w-4 h-4" /> }
        };

        const config = configs[status] || configs.open;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    return (
        <div className="w-full max-w-2xl px-4 py-12 animate-in fade-in duration-700">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors">
                <ArrowLeft size={16} /> Geri Dön
            </Link>

            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Talep Takibi</h1>
                    <p className="text-slate-500 font-medium">Belediyemize ilettiğiniz talebin durumunu buradan takip edebilirsiniz.</p>
                </div>

                {!ticket ? (
                    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-blue-500/10 bg-white dark:bg-slate-900 p-2">
                        <CardHeader className="pt-8 px-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Talep Sorgula</CardTitle>
                            <CardDescription className="font-medium text-slate-400">Takip etmek istediğiniz talebin bilgilerini girin.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="ticketId" className="text-xs font-black uppercase tracking-widest text-slate-400">Talep Numarası (ID)</Label>
                                    <Input
                                        id="ticketId"
                                        placeholder="Örn: 123"
                                        value={ticketId}
                                        onChange={(e) => setTicketId(e.target.value)}
                                        className="rounded-2xl bg-slate-50 dark:bg-slate-950 border-none h-14 font-bold text-lg focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-400">Telefon Numarası</Label>
                                    <Input
                                        id="phone"
                                        placeholder="05XX XXX XX XX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="rounded-2xl bg-slate-50 dark:bg-slate-950 border-none h-14 font-bold text-lg focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <Button
                                    disabled={loading}
                                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <><Search className="mr-2" /> SORGULA</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-blue-500/5 bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Talep Detayı</p>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">#{ticket.id}</h2>
                                    </div>
                                    <StatusBadge status={ticket.status} />
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950">
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{ticket.summary}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{ticket.description || "Açıklama belirtilmemiş."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950">
                                            <Calendar className="w-5 h-5 text-blue-500" />
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Tarih</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(ticket.created_at).toLocaleDateString("tr-TR")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950">
                                            <MapPin className="w-5 h-5 text-red-500" />
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Konum</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                                    {ticket.location || "Belirtilmedi"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {ticket.profiles && (
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                                            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-[9px] font-black text-blue-500/70 uppercase">Atanan Personel</p>
                                                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                                    {ticket.profiles.full_name}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setTicket(null)}
                                    className="w-full h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-slate-500 hover:text-slate-900"
                                >
                                    Yeni Sorgulama Yap
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
