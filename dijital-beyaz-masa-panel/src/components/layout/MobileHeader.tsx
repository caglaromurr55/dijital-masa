"use client";

import { useSidebar } from "@/context/SidebarContext";
import { Menu, Building2 } from "lucide-react";

export default function MobileHeader() {
    const { setMobileOpen } = useSidebar();

    return (
        <header className="lg:hidden flex items-center justify-between px-6 h-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 transition-colors">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-lg shadow-blue-100 dark:shadow-none">
                    <Building2 size={18} />
                </div>
                <h1 className="font-black text-slate-900 dark:text-slate-100 text-sm tracking-tight uppercase">
                    Dijital Masa
                </h1>
            </div>

            <button
                onClick={() => setMobileOpen(true)}
                className="p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                aria-label="Menüyü Aç"
            >
                <Menu size={24} />
            </button>
        </header>
    );
}
