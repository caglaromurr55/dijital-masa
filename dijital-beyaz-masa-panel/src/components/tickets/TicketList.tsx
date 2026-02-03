"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye } from "lucide-react";
import { Ticket, TicketStatus } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AddTicketDialog } from "./AddTicketDialog";
import { EditTicketDialog } from "./EditTicketDialog";
import { TicketDetailDialog } from "./TicketDetailDialog";
import { updateTicketStatus } from "@/actions/tickets";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export const DEPARTMENTS: Record<number, string> = {
  1: "Fen İşleri", 2: "Temizlik İşleri", 3: "Park ve Bahçeler",
  4: "Zabıta", 5: "Veterinerlik", 6: "Kültür ve Sosyal", 7: "Destek Hizmetleri"
};

export const getDepartmentName = (id?: number) => {
  if (!id) return "Atanmamış";
  return DEPARTMENTS[id] || "Diğer";
};

export default function TicketList({ initialTickets }: { initialTickets: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets as Ticket[]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Sync with server data
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  // URL Params State
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "all";

  const [searchValue, setSearchValue] = useState(initialSearch);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== initialSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue) {
          params.set("search", searchValue);
        } else {
          params.delete("search");
        }
        params.set("page", "1"); // Reset query to page 1
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, router, pathname, searchParams, initialSearch]);

  const handleStatusFilterChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "all") {
      params.set("status", val);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge className="bg-red-50 text-red-600 border-red-100 font-bold px-3 py-1">Yeni</Badge>;
      case "in_progress": return <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-bold px-3 py-1">İşlemde</Badge>;
      case "resolved": return <Badge className="bg-green-50 text-green-600 border-green-100 font-bold px-3 py-1">Çözüldü</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-500 font-bold px-3 py-1">Bilinmiyor</Badge>;
    }
  };

  const handleStatusChange = async (id: number, newStatus: TicketStatus) => {
    setLoadingId(id);
    try {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      toast.success("Durum güncelleniyor...");

      const result = await updateTicketStatus(id, newStatus);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Durum başarıyla güncellendi");
      router.refresh(); // Refresh to ensure backend consistency
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-1 flex-col md:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Şikayet veya isim ara..."
              className="pl-10 h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl focus-visible:ring-blue-100 shadow-inner dark:text-slate-200"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-xl border border-slate-100 dark:border-slate-800 h-11">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={initialStatus} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-44 border-none bg-transparent shadow-none text-xs font-bold text-slate-600 dark:text-slate-300">
                  <SelectValue placeholder="Tüm Durumlar" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="new">Yeni</SelectItem>
                  <SelectItem value="in_progress">İşlemde</SelectItem>
                  <SelectItem value="resolved">Çözüldü</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <AddTicketDialog onTicketAdded={() => router.refresh()} />
      </div>

      <div className="overflow-x-auto px-2">
        <Table className="min-w-275">
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
              <TableHead className="px-6 h-14">
                <DataTableColumnHeader column={{ id: "citizen_name", title: "ID & Vatandaş" }} />
              </TableHead>
              <TableHead className="h-14">
                <DataTableColumnHeader column={{ id: "department_id", title: "Departman" }} />
              </TableHead>
              <TableHead className="h-14">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Şikayet Özeti</div>
              </TableHead>
              <TableHead className="h-14">
                <DataTableColumnHeader column={{ id: "status", title: "Durum" }} className="justify-center" />
              </TableHead>
              <TableHead className="text-right px-8 h-14 font-bold text-slate-400 text-[10px] uppercase tracking-wide">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="hover:bg-blue-50/10 dark:hover:bg-blue-900/10 border-b border-slate-50 dark:border-slate-800 group">
                <TableCell className="px-6 py-4 font-bold text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-900 dark:text-slate-100">#{ticket.id}</span>
                    <span className="text-xs text-slate-400 font-semibold uppercase">{ticket.citizen_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg uppercase border border-blue-100 dark:border-blue-900/50">
                    {getDepartmentName(ticket.department_id)}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[320px]" title={ticket.summary}>
                    {ticket.summary}
                  </p>
                </TableCell>
                <TableCell className="text-center">{getStatusBadge(ticket.status)}</TableCell>
                <TableCell className="text-right px-8">
                  <div className="flex items-center justify-end gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <TicketDetailDialog ticket={ticket} />
                      <EditTicketDialog ticket={ticket} onTicketUpdated={() => router.refresh()} />
                    </div>
                    <Select defaultValue={ticket.status} onValueChange={(val) => handleStatusChange(ticket.id, val as TicketStatus)} disabled={loadingId === ticket.id}>
                      <SelectTrigger className="w-32 h-9 text-[11px] font-bold bg-white dark:bg-slate-900 rounded-xl shadow-sm border-slate-200 dark:border-slate-800 dark:text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-xl">
                        <SelectItem value="new">Yeni</SelectItem>
                        <SelectItem value="in_progress">İşlemde</SelectItem>
                        <SelectItem value="resolved">Çözüldü</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}