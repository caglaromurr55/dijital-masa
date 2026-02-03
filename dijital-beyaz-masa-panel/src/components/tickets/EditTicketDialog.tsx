"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Pencil, MapPin } from "lucide-react";
import { Ticket, TicketStatus } from "@/types";
import { toast } from "sonner";
import { DEPARTMENTS } from "./TicketList";
import UserSelect from "../admin/UserSelect";

const WEBHOOK_URL = "https://n8nm.31.57.156.128.sslip.io/webhook/ticket-solved";

interface EditTicketDialogProps {
  ticket: Ticket;
  onTicketUpdated: (updatedTicket: Ticket) => void;
}

export function EditTicketDialog({ ticket, onTicketUpdated }: EditTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    citizen_name: ticket.citizen_name || "",
    citizen_phone: ticket.citizen_phone || "",
    summary: ticket.summary || "",
    location: ticket.location || "",
    status: ticket.status as TicketStatus,
    department_id: ticket.department_id?.toString() || "",
  });

  const createAutoMessage = (status: string) => {
    const date = new Date(ticket.created_at).toLocaleDateString("tr-TR");
    const summary = formData.summary || "Talebiniz";
    const greeting = "Değerli Vatandaşımız";
    if (status === "in_progress") return `⚙️ ${greeting}, "${summary}" konulu talebiniz işleme alınmış olup ilgili saha ekiplerimize yönlendirilmiştir. 👷‍♂️ Çalışmalarımız devam etmektedir.`;
    if (status === "resolved") return `✅ ${greeting}, ${date} tarihinde belediyemize ilettiğiniz "${summary}" konulu şikayetiniz çözüme kavuşmuştur. 🎉 Bilgilerinize sunarız.`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("tickets")
        .update({
          citizen_name: formData.citizen_name,
          citizen_phone: formData.citizen_phone,
          summary: formData.summary,
          location: formData.location,
          status: formData.status,
          department_id: formData.department_id ? parseInt(formData.department_id) : null,
        })
        .eq('id', ticket.id)
        .select()
        .single();

      if (error) throw error;

      if (formData.status !== ticket.status) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('audit_logs').insert({
            user_id: user.id,
            action_type: 'TICKET_UPDATE',
            description: `Talep #${ticket.id} durumu "${formData.status}" olarak güncellendi.`
          });
        }

        const autoMessage = createAutoMessage(formData.status);
        if (WEBHOOK_URL && autoMessage) {
          fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              citizen_phone: formData.citizen_phone,
              message: autoMessage
            }),
          }).catch(err => console.warn("Webhook uyarısı:", err));
        }
      }

      toast.success("Talep başarıyla güncellendi");
      onTicketUpdated(data as Ticket);
      setOpen(false);
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125 bg-white border-none rounded-[2.5rem] p-8 shadow-2xl z-9999">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Talebi Düzenle</DialogTitle>
          <DialogDescription className="font-medium text-slate-400">Vatandaş bildirim bilgilerini güncelleyin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vatandaş Adı */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Vatandaş Adı</Label>
              <Input
                value={formData.citizen_name}
                onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 h-11 w-full focus:bg-white transition-all shadow-sm font-semibold text-sm px-4"
                required
              />
            </div>

            {/* Durum Kutusu */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as TicketStatus })}
              >
                <SelectTrigger className="rounded-xl border border-slate-200 bg-slate-50 h-11 w-full focus:bg-white transition-all shadow-sm font-semibold text-xs px-4">
                  <SelectValue placeholder="Seç" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl z-[10001]">
                  <SelectItem value="new">Yeni</SelectItem>
                  <SelectItem value="in_progress">İşlemde</SelectItem>
                  <SelectItem value="resolved">Çözüldü</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Departman Seçimi */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">İlgili Birim</Label>
              <Select
                value={formData.department_id}
                onValueChange={(val) => setFormData({ ...formData, department_id: val })}
              >
                <SelectTrigger className="rounded-xl border border-slate-200 bg-slate-50 h-11 w-full focus:bg-white transition-all shadow-sm font-semibold text-xs px-4">
                  <SelectValue placeholder="Birim Seç" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl z-[10001]">
                  {Object.entries(DEPARTMENTS).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Atanan Personel</Label>
              <UserSelect ticketId={ticket.id} currentAssigneeId={ticket.assigned_to} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Telefon</Label>
              <Input
                value={formData.citizen_phone}
                onChange={(e) => setFormData({ ...formData, citizen_phone: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 h-11 w-full focus:bg-white transition-all shadow-sm font-semibold text-sm px-4"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Konum / Adres</Label>
            <div className="flex gap-2">
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 h-11 flex-1 focus:bg-white transition-all shadow-sm font-semibold text-sm px-4"
                required
              />
              {(ticket.latitude && ticket.longitude) && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl px-4 border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-bold text-xs flex gap-2"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${ticket.latitude},${ticket.longitude}`, '_blank')}
                >
                  <MapPin size={16} /> Yol Tarifi
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Şikayet Özeti</Label>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 h-28 resize-none focus:bg-white transition-all shadow-sm p-4 text-sm font-semibold leading-relaxed"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-xl shadow-blue-100 transition-all">
              {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}