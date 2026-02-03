"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Send, MapPin, Camera, User, FileText } from "lucide-react";
import { createTicketPublic } from "@/actions/tickets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import MapPicker from "@/components/map/MapPicker";
import EvidenceUploader from "../field/EvidenceUploader";

// Step Definitions
const STEPS = [
    { number: 1, title: "Kimlik Bilgileri", icon: User },
    { number: 2, title: "Talep Detayı", icon: FileText },
    { number: 3, title: "Konum & Medya", icon: MapPin },
];

export default function TicketWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        citizen_name: "",
        citizen_tc: "",
        citizen_phone: "",
        summary: "",
        description: "",
        category: "sikayet", // Default
        priority: "normal",
        latitude: null as number | null,
        longitude: null as number | null,
        media_url: "",
    });

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setLoading(true);

        const form = new FormData();
        form.append("citizen_name", formData.citizen_name);
        form.append("citizen_tc", formData.citizen_tc);
        form.append("citizen_phone", formData.citizen_phone);
        form.append("category", formData.category);
        form.append("summary", formData.summary);
        form.append("description", formData.description);
        form.append("media_url", formData.media_url); // Pending upload logic
        if (formData.latitude) form.append("latitude", formData.latitude.toString());
        if (formData.longitude) form.append("longitude", formData.longitude.toString());

        const result = await createTicketPublic(form);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Başvurunuz başarıyla alındı. Teşekkür ederiz.");
            // Reset or Redirect
            setStep(1);
            setFormData({
                citizen_name: "", citizen_tc: "", citizen_phone: "",
                summary: "", description: "", category: "sikayet", priority: "normal",
                latitude: null, longitude: null, media_url: ""
            });
            router.push("/");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex justify-between items-center px-2">
                {STEPS.map((s) => {
                    const isActive = s.number === step;
                    const isCompleted = s.number < step;
                    return (
                        <div key={s.number} className="flex flex-col items-center gap-2 relative z-10 w-1/3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110" :
                                isCompleted ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                }`}>
                                <s.icon size={18} />
                            </div>
                            <span className={`text-[10px] uppercase font-black tracking-wider ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
                {/* Connecting Line (Simplified) */}
                <div className="absolute top-[4.5rem] left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0 hidden md:block" />
            </div>

            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 pt-10 min-h-[400px] flex flex-col">

                    {/* STEP 1: PERSONAL INFO */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <User className="text-blue-500" /> Kimlik Bilgileri
                            </h2>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Ad Soyad</Label>
                                    <Input
                                        placeholder="Örn: Ahmet Yılmaz"
                                        value={formData.citizen_name}
                                        onChange={e => setFormData({ ...formData, citizen_name: e.target.value })}
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>T.C. Kimlik No (Opsiyonel)</Label>
                                    <Input
                                        placeholder="11 Haneli TC Kimlik No"
                                        maxLength={11}
                                        value={formData.citizen_tc}
                                        onChange={e => setFormData({ ...formData, citizen_tc: e.target.value })}
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefon</Label>
                                    <Input
                                        placeholder="05XX XXX XX XX"
                                        type="tel"
                                        value={formData.citizen_phone}
                                        onChange={e => setFormData({ ...formData, citizen_phone: e.target.value })}
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <FileText className="text-blue-500" /> Talep Detayı
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Kategori</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={v => setFormData({ ...formData, category: v })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="sikayet">Şikayet</SelectItem>
                                            <SelectItem value="oneri">Öneri / İstek</SelectItem>
                                            <SelectItem value="bilgi">Bilgi Edinme</SelectItem>
                                            <SelectItem value="acil">Acil Durum</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Konu Başlığı</Label>
                                    <Input
                                        placeholder="Örn: Parktaki banklar kırık"
                                        value={formData.summary}
                                        onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Açıklama</Label>
                                    <Textarea
                                        placeholder="Lütfen detaylı bilgi veriniz..."
                                        rows={5}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="rounded-xl resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: LOCATION & MEDIA */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <MapPin className="text-blue-500" /> Konum ve Medya
                            </h2>

                            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                                <MapPicker onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fotoğraf Yükle (Opsiyonel)</Label>
                                <EvidenceUploader
                                    ticketId={Math.floor(Math.random() * 100000)}
                                    onUploadComplete={(url) => setFormData({ ...formData, media_url: url })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-auto pt-8 flex justify-between">
                        {step > 1 ? (
                            <Button variant="ghost" onClick={handlePrev} className="text-slate-500 font-bold">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Geri
                            </Button>
                        ) : <div />}

                        {step < 3 ? (
                            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-blue-100 dark:shadow-none">
                                Devam Et <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-green-100 dark:shadow-none">
                                {loading ? "Gönderiliyor..." : "Başvuruyu Tamamla"} <Send className="ml-2 w-4 h-4" />
                            </Button>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
