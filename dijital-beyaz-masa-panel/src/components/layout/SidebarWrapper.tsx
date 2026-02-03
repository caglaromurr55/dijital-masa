"use client";

import { useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation"; // Pathname'i ekle
import React from "react";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();

  // ✅ Login sayfasındaysak sidebar payı bırakmadan tam ekran göster
  if (pathname === '/login') {
    return <main className="w-full h-full overflow-y-auto">{children}</main>;
  }

  return (
    <main
      className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out`}
    >
      {children}
    </main>
  );
}