"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateEvent } from "@/actions/events";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { Event } from "@/types";

interface EditEventDialogProps { event: Event; onEventUpdated: () => void; }

export function EditEventDialog({ event, onEventUpdated }: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formatForInput = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: event.title, description: event.description, location: event.location,
    start_time: formatForInput(event.start_time), end_time: formatForInput(event.end_time),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('location', formData.location);
    formDataObj.append('start_time', formData.start_time);
    formDataObj.append('end_time', formData.end_time);

    const result = await updateEvent(event.id, formDataObj);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success("Etkinlik başarıyla güncellendi");
      onEventUpdated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      {/* Şeffaflık Sorunu Giderildi: bg-white ve shadow eklendi */}
      <DialogContent className="sm:max-w-120 bg-white dark:bg-slate-950 border-none rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-none z-9999">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Düzenle</DialogTitle>
          <DialogDescription className="font-medium text-slate-400">Etkinlik bilgilerini buradan güncelleyin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Etkinlik Adı</Label>
            {/* Görünürlük Sorunu Giderildi: border-slate-200 eklendi */}
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 h-11 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Başlangıç</Label>
              <Input type="datetime-local" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 h-11 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100 dark:[color-scheme:dark]" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Bitiş</Label>
              <Input type="datetime-local" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 h-11 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100 dark:[color-scheme:dark]" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Konum</Label>
            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 h-11 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Açıklama</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 resize-none focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100" rows={3} />
          </div>
          <DialogFooter className="pt-6">
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-xl shadow-blue-100 transition-all">
              {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}