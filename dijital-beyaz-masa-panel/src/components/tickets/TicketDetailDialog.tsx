"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Phone, User, Calendar, FileText, Building2, Camera } from "lucide-react";
import { Ticket } from "@/types";

// HATA ÇÖZÜMÜ: Departman listesi ve fonksiyonu buraya taşındı.
const DEPARTMENTS: Record<number, string> = {
  1: "Fen İşleri",
  2: "Temizlik İşleri",
  3: "Park ve Bahçeler",
  4: "Zabıta",
  5: "Veterinerlik",
  6: "Kültür ve Sosyal",
  7: "Destek Hizmetleri"
};

const getDepartmentName = (id?: number) => {
  if (!id) return "Atanmamış";
  return DEPARTMENTS[id] || "Diğer";
};

interface TicketDetailDialogProps {
  ticket: Ticket;
}

export function TicketDetailDialog({ ticket }: TicketDetailDialogProps) {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Yeni</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">İşlemde</Badge>;
      case "resolved":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Çözüldü</Badge>;
      default:
        return <Badge className="bg-slate-500 text-white">Bilinmiyor</Badge>;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" title="Detayları İncele">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto bg-white text-slate-900">
        <DialogHeader>
          <div className="flex justify-between items-start pr-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Talep #{ticket.id}
                {getStatusBadge(ticket.status)}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Oluşturulma: {new Date(ticket.created_at).toLocaleDateString("tr-TR", {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">

          {/* Vatandaş Bilgileri */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              Vatandaş Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Adı Soyadı</span>
                <span className="font-medium text-slate-900">
                  {ticket.citizen_name?.startsWith("~") ? "İsimsiz Vatandaş" : ticket.citizen_name || "Belirtilmemiş"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Telefon</span>
                <div className="flex items-center gap-1 font-medium text-slate-900">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {ticket.citizen_phone}
                </div>
              </div>
            </div>
          </div>

          {/* Talep Detayları */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <span className="text-blue-600 text-xs font-semibold flex items-center gap-1 mb-1">
                  <Building2 className="w-3 h-3" /> İlgili Birim
                </span>
                <span className="text-blue-900 font-bold text-sm">
                  {getDepartmentName(ticket.department_id)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 text-xs font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Konum
                  </span>
                  {(ticket.latitude && ticket.longitude) && (
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${ticket.latitude},${ticket.longitude}`, '_blank')}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      Yol Tarifi <Eye className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <span className="text-slate-900 font-medium text-sm truncate block" title={ticket.location}>
                  {ticket.location}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-500 text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Şikayet / Talep Özeti
              </span>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-slate-700 text-sm leading-relaxed min-h-25">
                {ticket.summary}
              </div>
            </div>

            {ticket.media_url && (
              <div className="space-y-2">
                <span className="text-slate-500 text-sm font-semibold flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Çözüm / Kanıt Fotoğrafı
                </span>
                <div className="relative h-64 w-full rounded-lg overflow-hidden border border-slate-200">
                  <img src={ticket.media_url} alt="Çözüm Kanıtı" className="object-cover w-full h-full" />
                </div>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}