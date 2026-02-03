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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Camera } from "lucide-react";
import { Ticket } from "@/types";
import { DEPARTMENTS } from "./TicketList";
import EvidenceUploader from "../field/EvidenceUploader";

interface AddTicketDialogProps {
  onTicketAdded: (newTicket: Ticket) => void;
}

export function AddTicketDialog({ onTicketAdded }: AddTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    citizen_name: "",
    citizen_phone: "",
    summary: "",
    location: "",
    department_id: "",
    media_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          citizen_name: formData.citizen_name,
          citizen_phone: formData.citizen_phone,
          summary: formData.summary,
          location: formData.location,
          department_id: formData.department_id ? parseInt(formData.department_id) : null,
          status: "new",
          media_url: formData.media_url || null,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (!error && data) {
      setOpen(false);
      setFormData({
        citizen_name: "",
        citizen_phone: "",
        summary: "",
        location: "",
        department_id: "",
        media_url: ""
      });
      onTicketAdded(data as Ticket);
    } else {
      alert("Hata oluştu: " + (error?.message || "Bilinmeyen hata"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus className="w-4 h-4 mr-2" />
          Manuel Kayıt Aç
        </Button>
      </DialogTrigger>
      {/* Şeffaflık sorunu bg-white ile çözüldü, aşırı z-index kaldırıldı */}
      <DialogContent className="sm:max-w-120 bg-white border-none rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Yeni Şikayet/Talep Oluştur</DialogTitle>
          <DialogDescription className="font-medium text-slate-400">
            Beyaz Masa'ya şahsen veya telefonla başvuran vatandaşın kaydını buradan oluşturabilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="citizen_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Vatandaş Adı</Label>
              <Input
                id="citizen_name"
                value={formData.citizen_name}
                onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 h-11 focus:bg-white transition-all shadow-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citizen_phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Telefon</Label>
              <Input
                id="citizen_phone"
                value={formData.citizen_phone}
                placeholder="905..."
                onChange={(e) => setFormData({ ...formData, citizen_phone: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 h-11 focus:bg-white transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Konum / Adres</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 h-11 focus:bg-white transition-all shadow-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">İlgili Departman</Label>
              <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                <SelectTrigger className="rounded-xl border border-slate-200 bg-slate-50 h-11 focus:bg-white transition-all shadow-sm font-bold text-xs">
                  <SelectValue placeholder="Departman Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[10001]">
                  {Object.entries(DEPARTMENTS).map(([id, name]) => (
                    <SelectItem key={id} value={id} className="cursor-pointer hover:bg-slate-50 transition-colors">{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Şikayet Özeti</Label>
            <Textarea
              id="summary"
              placeholder="Vatandaşın beyanı..."
              className="rounded-xl border border-slate-200 bg-slate-50 h-28 resize-none focus:bg-white transition-all shadow-sm p-4"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fotoğraf (Opsiyonel)</Label>
            <EvidenceUploader
              ticketId={Math.floor(Math.random() * 100000)} // Geçici ID, gerçekte bilet oluştuktan sonra atanmalı ama tasarım için burada
              onUploadComplete={(url) => setFormData({ ...formData, media_url: url })}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-xl shadow-blue-100 transition-all">
              {loading ? "Kaydediliyor..." : "Kaydı Aç"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}