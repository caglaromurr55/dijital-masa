import { getDashboardStats } from "@/actions/dashboard";
import { getNotes } from "@/actions/notes";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  History,
  UserPlus,
  Clock,
  MapPin,
  ChevronRight,
  Archive,
  PlusCircle,
  Zap,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import CountdownTimer from "@/components/events/CountdownTimer";
import QuickNotes from "@/components/dashboard/QuickNotes";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export default async function Dashboard() {
  const stats = await getDashboardStats();
  const notes = await getNotes();

  if (!stats) return <div className="p-8 text-center text-slate-400 font-medium">Lütfen giriş yapın.</div>;

  const {
    profile,
    isAdmin,
    showTickets,
    showEvents,
    isCultureDept,
    ticketStats,
    eventStats,
    upcomingEvents,
    logs,
    recentTickets
  } = stats;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 animate-in fade-in duration-1000">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
            <LayoutDashboard size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              Hoş Geldiniz, {profile?.full_name}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Birim Operasyon Paneli • {isAdmin ? 'Yönetici' : 'Personel'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showEvents && (
            <Link href="/events">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 shadow-lg shadow-purple-100 transition-all hover:-translate-y-0.5 font-bold">
                <PlusCircle className="mr-2 h-4 w-4" /> Yeni Etkinlik
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/users">
              <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full font-bold h-10 px-5">
                <UserPlus className="mr-2 h-4 w-4" /> Personel Ekle
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* İSTATİSTİK KUTULARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {showEvents && (
          <>
            <StatCard title="TOPLAM ETKİNLİK" value={eventStats.total} icon={<CalendarDays className="text-blue-600" />} />
            <StatCard title="AKTİF ETKİNLİK" value={eventStats.active} icon={<Zap className="text-green-600" />} pulse />
            <StatCard title="GEÇMİŞ" value={eventStats.past} icon={<Archive className="text-slate-400" />} />
          </>
        )}
        {!isCultureDept && showTickets && (
          <>
            <StatCard title="TOPLAM TALEP" value={ticketStats.total} icon={<MessageSquare className="text-blue-600" />} />
            <StatCard title="AKTİF TALEP" value={ticketStats.active} icon={<AlertCircle className="text-orange-600" />} />
            <StatCard title="ÇÖZÜLENLER" value={ticketStats.resolved} icon={<CheckCircle2 className="text-green-600" />} />
          </>
        )}
      </div>

      {/* GRAFİKLER */}
      {showTickets && recentTickets && recentTickets.length > 0 && (
        <DashboardCharts tickets={recentTickets} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* SOL KOLON: YAKLAŞAN ETKİNLİKLER */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" /> Yaklaşan Etkinlikler
            </h2>
            <Link href="/events" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1">
              Tüm Takvim <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-sm border border-slate-50 dark:border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event: any) => (
                <div key={event.id} className="p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.title}</h3>
                      <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-2"><CalendarDays size={14} className="text-blue-500" /> {new Date(event.start_time).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' })}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-red-500" /> {event.location}</span>
                      </div>
                    </div>
                    <CountdownTimer targetDate={event.start_time} />
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-400 italic">Planlanmış etkinlik bulunmuyor.</div>
              )}
            </div>
          </div>

          {/* SADECE ADMIN İÇİN LOGLAR */}
          {isAdmin && (
            <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-sm border border-slate-50 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" /> Sistem Kayıtları
              </h2>
              <div className="space-y-3">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-50 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.description}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(log.created_at).toLocaleTimeString("tr-TR")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SAĞ KOLON: HATIRLATICILAR */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 px-2">
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Notlar
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-sm border border-slate-50 dark:border-slate-800 p-8">
            <QuickNotes initialNotes={notes} />
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, pulse }: { title: string, value: number, icon: any, pulse?: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between group hover:shadow-md transition-all">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h4 className="text-4xl font-black text-slate-900 dark:text-slate-100">{value}</h4>
      </div>
      <div className="relative p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
        {pulse && <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />}
        {icon}
      </div>
    </div>
  );
}