"use client";

import { useState } from "react";
import { Event } from "@/types";
import { AddEventDialog } from "@/components/events/AddEventDialog";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    CalendarDays, MapPin, Lock, Search, LayoutGrid, List as ListIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleEventStatus } from "@/actions/events";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EventsClientProps {
    initialEvents: Event[];
    canEdit: boolean;
}

export default function EventsClient({ initialEvents, canEdit }: EventsClientProps) {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const router = useRouter();

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        if (!canEdit) return;

        // Optimistic Update
        setEvents(prev => prev.map(e => e.id === id ? { ...e, is_active: !currentStatus } : e));
        toast.success("Durum güncelleniyor...");

        const result = await toggleEventStatus(id, currentStatus);

        if (result.error) {
            toast.error("Hata: " + result.error);
            // Revert
            setEvents(prev => prev.map(e => e.id === id ? { ...e, is_active: currentStatus } : e));
        } else {
            toast.success("Etkinlik durumu güncellendi");
            router.refresh();
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    const filteredEvents = events.filter(event => {
        const searchLower = search.toLowerCase();
        return (
            event.title.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower) ||
            event.description?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors">
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase truncate">Etkinlik Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-1 max-w-lg">Belediye etkinlik takvimini buradan profesyonelce yönetin.</p>
                </div>
                {canEdit ? (
                    <div className="w-full md:w-auto">
                        <AddEventDialog onEventAdded={() => router.refresh()} />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 dark:bg-orange-900/10 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-900/40">
                        <Lock size={14} /> Görüntüleme Modu
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Etkinlik ara..."
                        className="pl-11 h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner text-sm focus-visible:ring-blue-100 dark:text-slate-100"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl w-full sm:w-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 sm:flex-none rounded-lg h-9 px-4 transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        onClick={() => setViewMode("grid")}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" /> Kart
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 sm:flex-none rounded-lg h-9 px-4 transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        onClick={() => setViewMode("list")}
                    >
                        <ListIcon className="h-4 w-4 mr-2" /> Liste
                    </Button>
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
                    {filteredEvents.map((event) => (
                        <Card
                            key={event.id}
                            className={`group transition-all rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col ${event.is_active ? "bg-white dark:bg-slate-900 hover:shadow-xl dark:hover:shadow-none" : "bg-slate-50/50 dark:bg-slate-950/50 opacity-75"
                                }`}
                        >
                            <CardHeader className="pb-4 relative px-6 sm:px-8 pt-6 sm:pt-8">
                                <div className="flex justify-between items-start">
                                    <Badge className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border-none ${event.is_active ? "bg-blue-600 text-white" : "bg-slate-400 text-white"}`}>
                                        {event.is_active ? "Yayında" : "Arşiv"}
                                    </Badge>
                                    {canEdit && (
                                        <div className="flex items-center gap-3">
                                            <EditEventDialog event={event} onEventUpdated={() => router.refresh()} />
                                            <Switch
                                                checked={event.is_active}
                                                onCheckedChange={() => handleToggleStatus(event.id, event.is_active)}
                                                className="data-[state=checked]:bg-green-500 scale-90 transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                                <CardTitle className={`mt-4 sm:mt-5 text-lg sm:text-xl font-black leading-tight tracking-tight ${event.is_active ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500 line-through"}`}>
                                    {event.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-1 flex flex-col justify-between px-6 sm:px-8 pb-6 sm:pb-8">
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed">
                                    {event.description}
                                </p>
                                <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
                                    <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-50/50 dark:border-blue-900/20">
                                        <CalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[9px] text-blue-400 font-black uppercase tracking-tight mb-1">Tarih</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatDate(event.start_time)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                                        <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-tight mb-1">Konum</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden mb-10 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                <TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest px-8 h-14">Etkinlik</TableHead>
                                <TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest h-14">Zaman</TableHead>
                                <TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest text-right px-8 h-14">Yönetim</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="font-medium text-sm">
                            {filteredEvents.map((event) => (
                                <TableRow key={event.id} className="group hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors border-b border-slate-50 dark:border-slate-800">
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${event.is_active ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-white dark:text-slate-500"}`}>
                                                <CalendarDays size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] ${!event.is_active && "text-slate-400 dark:text-slate-500 line-through"}`}>{event.title}</p>
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{event.location}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                        {formatDate(event.start_time)}
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        {canEdit && (
                                            <div className="flex items-center justify-end gap-5">
                                                <EditEventDialog event={event} onEventUpdated={() => router.refresh()} />
                                                <Switch
                                                    checked={event.is_active}
                                                    onCheckedChange={() => handleToggleStatus(event.id, event.is_active)}
                                                    className="data-[state=checked]:bg-green-500 transition-all"
                                                />
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
