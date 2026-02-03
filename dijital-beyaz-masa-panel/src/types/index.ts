// src/types/index.ts

export type TicketStatus = 'new' | 'in_progress' | 'resolved';

export interface Ticket {
  id: number;
  created_at: string;
  citizen_name?: string;     // n8n'den gelen isim
  citizen_phone?: string;    // n8n'den gelen telefon
  department_id?: number;    // n8n'den gelen birim ID'si
  status: TicketStatus;      // Durum
  summary: string;           // ESKİSİ: description -> YENİSİ: summary
  location?: string;         // ESKİSİ: address -> YENİSİ: location
  ai_analysis?: string;      // AI analizi
  neighborhood?: string;     // Mahalle
  latitude?: number;         // Harita
  longitude?: number;        // Harita
  rating?: number;
  media_url?: string | null; // Fotoğraf URL
  assigned_to?: string | null; // Atanan Personel ID
}

export interface Event {
  id: number;
  title: string;       // Etkinlik Adı
  description: string; // Açıklama
  location: string;    // Konum
  start_time: string;  // Başlangıç (Date yerine geldi)
  end_time: string;    // Bitiş (Yeni geldi)
  is_active: boolean;  // Aktiflik durumu
  created_at: string;
}