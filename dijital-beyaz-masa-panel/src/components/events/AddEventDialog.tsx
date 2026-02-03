"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addEvent } from "@/actions/events";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export function AddEventDialog({ onEventAdded }: { onEventAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", location: "", start_time: "", end_time: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('location', formData.location);
    formDataObj.append('start_time', formData.start_time);
    formDataObj.append('end_time', formData.end_time);

    const result = await addEvent(formDataObj);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      setFormData({ title: "", description: "", location: "", start_time: "", end_time: "" });
      toast.success("Etkinlik başarıyla oluşturuldu");
      onEventAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-blue-100 transition-all">
          <Plus className="w-5 h-5 mr-2" /> Yeni Etkinlik Ekle
        </Button>
      </DialogTrigger>
      {/* Şeffaflık Sorunu Giderildi: bg-white eklendi */}
      <DialogContent className="sm:max-w-120 bg-white dark:bg-slate-950 border-none rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-none z-9999">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Etkinlik Oluştur</DialogTitle>
          <DialogDescription className="font-medium text-slate-400">Takvime eklenecek faaliyetin detaylarını giriniz.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Etkinlik Adı</Label>
            {/* Görünürlük Sorunu Giderildi: border-slate-200 eklendi */}
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-11 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Başlangıç</Label>
              <Input type="datetime-local" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-11 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100 dark:[color-scheme:dark]" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Bitiş</Label>
              <Input type="datetime-local" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-11 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100 dark:[color-scheme:dark]" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Konum</Label>
            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-11 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Açıklama</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 resize-none focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm dark:text-slate-100" rows={3} />
          </div>
          <DialogFooter className="pt-6">
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-xl shadow-blue-100 transition-all">
              {loading ? "Yayınlanıyor..." : "Etkinliği Yayınla"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}