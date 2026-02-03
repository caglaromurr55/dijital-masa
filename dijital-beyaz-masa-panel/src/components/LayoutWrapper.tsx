"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Eğer giriş sayfasındaysak Sidebar'ı GİZLE, sadece sayfayı göster
  if (isLoginPage) {
    return <main className="w-full h-full">{children}</main>;
  }

  // Diğer sayfalardaysak Sidebar'ı GÖSTER
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Sabit */}
      <aside className="w-64 hidden md:block shrink-0">
        <Sidebar />
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}