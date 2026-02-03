"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSidebar } from "@/context/SidebarContext";
import {
  LayoutDashboard,
  MessageSquare,
  CalendarDays,
  LogOut,
  Building2,
  UserPlus,
  Search,
  CloudSun,
  ChevronLeft,
  ChevronRight,
  MapPin,
  HardHat,
  BarChart3,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";

const DEPARTMENT_NAMES: Record<number, string> = {
  1: "Fen İşleri", 2: "Temizlik İşleri", 3: "Park ve Bahçeler",
  4: "Zabıta", 5: "Veterinerlik", 6: "Kültür ve Sosyal", 7: "Destek Hizmetleri"
};

interface SidebarProps {
  userProfile?: {
    full_name: string;
    role: string;
    department_id: number | null;
  } | null;
}

export default function Sidebar({ userProfile }: SidebarProps) {
  const { isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  // 3. Gerçek Zamanlı Bağlantı Kontrolü (30 sn'de bir ping atar)
  useEffect(() => {
    const checkConnection = async () => {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      setIsOnline(!error);
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sayfa değiştiğinde mobilde menüyü kapat
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  if (pathname === '/login') return null;

  if (!userProfile) {
    if (isCollapsed) return <div className="w-20 bg-white border-r h-full hidden lg:block" />;
    return (
      <div className="w-64 bg-white border-r h-full p-6 space-y-6 hidden lg:block">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const jobTitle = userProfile.role === 'admin' ? "Yönetici" : `${DEPARTMENT_NAMES[userProfile.department_id || 0] || 'Personel'}`;

  // 5. Bağlam Duyarlı Arama İşlevi
  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q = encodeURIComponent(searchQuery.trim());
      const isCultureDept = userProfile.department_id === 6;
      const isAdmin = userProfile.role === 'admin';
      const isOnEventsPage = pathname.startsWith('/events');

      if (isCultureDept || (isAdmin && isOnEventsPage)) {
        router.push(`/events?search=${q}`);
      } else {
        router.push(`/tickets?search=${q}`);
      }
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  // 6. Oturumu Kapatma
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const menuItems = [
    { title: "Panel", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { title: "Harita", path: "/dashboard/map", icon: <MapPin size={18} /> },
    { title: "Talepler", path: "/tickets", icon: <MessageSquare size={18} /> },
    { title: "Etkinlikler", path: "/events", icon: <CalendarDays size={18} /> },
    { title: "Raporlar", path: "/reports", icon: <BarChart3 size={18} /> },
    { title: "Saha Modülü", path: "/field/tasks", icon: <HardHat size={18} /> },
  ].filter(item => {
    if (userProfile.role === 'admin') return true;
    if (userProfile.department_id === 6) return item.path !== '/tickets';
    return item.path !== '/events';
  });

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 lg:relative flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-100/50 dark:border-slate-800 transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        ${isMobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0"}
      `}>

        {/* MOBILE CLOSE BUTTON */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-6 lg:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* DARALTMA BUTONU */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-10 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} className="text-slate-600" /> : <ChevronLeft size={14} className="text-slate-600" />}
        </button>

        {/* LOGO */}
        <div className={`h-20 flex items-center border-b border-slate-50 dark:border-slate-900 overflow-hidden ${isCollapsed ? "px-5" : "px-6"}`}>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100 dark:shadow-none">
              <Building2 size={22} />
            </div>
            {!isCollapsed && (
              <div className="leading-none animate-in fade-in duration-500">
                <h1 className="font-black text-slate-900 dark:text-slate-100 text-base tracking-tight">Dijital Masa</h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Belediye Yönetimi</span>
              </div>
            )}
          </div>
        </div>

        {/* ARAMA */}
        <div className={`mt-6 transition-all ${isCollapsed ? "px-5" : "px-4"}`}>
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
            {!isCollapsed ? (
              <Input
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100 animate-in fade-in dark:text-slate-200"
              />
            ) : (
              <div className="h-9 w-full bg-slate-50 dark:bg-slate-900 rounded-xl cursor-pointer" onClick={toggleSidebar} />
            )}
          </div>
        </div>

        {/* ANA MENÜ */}
        <div className="flex-1 px-3 mt-8 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ana Menü</p>}
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"}`}>
                <span className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}>{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-bold tracking-tight animate-in fade-in">{item.title}</span>}
              </Link>
            );
          })}

          {/* PERSONEL YÖNETİMİ */}
          {userProfile.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-800">
              <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${pathname === '/admin/users' ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"}`}>
                <UserPlus size={18} className={pathname === '/admin/users' ? "text-purple-600 dark:text-purple-400" : "text-slate-400"} />
                {!isCollapsed && <span className="text-sm font-bold tracking-tight animate-in fade-in">Personel Yönetimi</span>}
              </Link>
            </div>
          )}
        </div>

        {/* HAVA DURUMU */}
        {!isCollapsed && (
          <div className="px-4 mb-4 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-100 dark:shadow-none">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">İstanbul</p>
                  <h4 className="text-xl font-black leading-none text-white">12°C</h4>
                </div>
                <CloudSun size={20} className="text-blue-100" />
              </div>
              <p className="text-[9px] font-medium opacity-90 italic truncate">Parçalı Bulutlu</p>
            </div>
          </div>
        )}

        {/* SİSTEM DURUMU */}
        <div className="px-3 mb-6 space-y-1">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className={`h-2 w-2 rounded-full shrink-0 transition-colors ${isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500 animate-pulse"}`} />
            {!isCollapsed && <span className="text-[10px] font-bold text-slate-400 uppercase truncate animate-in fade-in">{isOnline ? "Sistem Çevrimiçi" : "Bağlantı Kesildi"}</span>}
          </div>
        </div>

        {/* PROFİL KARTI - YENİLENMİŞ TASARIM */}
        <div className={`mt-auto border-t border-slate-50 dark:border-slate-900 transition-all ${isCollapsed ? "p-2" : "p-4 bg-slate-50/50 dark:bg-slate-900/20"}`}>
          <div className={`rounded-3xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${isCollapsed ? "items-center" : ""}`}>

            {/* Üst Kısım: Kullanıcı Bilgileri */}
            <div className={`flex items-center gap-3 ${isCollapsed ? "p-2" : "p-4 pb-2"}`}>
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100 dark:shadow-none">
                {userProfile.full_name?.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-in slide-in-from-left-2">
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{userProfile.full_name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{jobTitle}</p>
                </div>
              )}
            </div>

            {/* Alt Kısım: Aksiyonlar (Sadece Açıkken Gösterilir) */}
            {!isCollapsed && (
              <div className="flex items-center justify-between px-4 pb-4 animate-in fade-in duration-500">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                  <NotificationBell />
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
                  <ThemeToggle />
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center h-10 w-10 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-90"
                  title="Güvenli Çıkış"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

            {/* Daraltılmış Modda Sadece Çıkış */}
            {isCollapsed && (
              <button
                onClick={handleLogout}
                className="mt-2 p-3 text-slate-400 hover:text-red-500 transition-colors"
                title="Oturumu Kapat"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}