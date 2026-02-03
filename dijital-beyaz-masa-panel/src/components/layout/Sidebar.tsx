"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  CalendarDays, 
  LogOut,
  Building2 
} from "lucide-react";

// AYARLAR SEKMESİ ÇIKARILDI
const menuItems = [
  { title: "Panel", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: "Talepler", path: "/tickets", icon: <MessageSquare className="w-5 h-5" /> },
  { title: "Etkinlikler", path: "/events", icon: <CalendarDays className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm">
      
      {/* LOGO */}
      <div className="flex items-center gap-2 h-16 px-6 border-b border-slate-100">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight">Dijital Masa</h1>
          <span className="text-[10px] text-slate-500 font-medium">BELEDİYE YÖNETİMİ</span>
        </div>
      </div>

      {/* MENÜ */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <span className={`transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                {item.icon}
              </span>
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* ÇIKIŞ */}
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
          <LogOut className="w-4 h-4" />
          Oturumu Kapat
        </button>
      </div>
    </div>
  );
}