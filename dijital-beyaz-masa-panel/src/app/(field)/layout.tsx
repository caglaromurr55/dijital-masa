import { Inter, Outfit } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import { HardHat, User, MessageSquare, LayoutDashboard } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
    title: "Saha Operasyon | DBM",
    description: "Dijital Beyaz Masa Saha Ekibi Arayüzü",
};

export default function FieldLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24`}>
            {/* Glossy Header */}
            <header className="sticky top-0 z-[100] px-4 py-4">
                <div className="mx-auto max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-xl shadow-blue-500/5 rounded-[2rem] px-6 py-4 flex justify-between items-center transition-all">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <HardHat size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-sm uppercase tracking-tighter leading-tight">Saha Ekibi</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operasyon Paneli</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                            <User size={18} className="text-slate-500" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto max-w-md px-4 pt-2 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {children}
            </main>

            {/* Floating Premium Bottom Navigation */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-[100]">
                <div className="bg-slate-900/95 dark:bg-slate-900/90 backdrop-blur-lg border border-white/10 shadow-2xl shadow-blue-900/40 rounded-[2.5rem] h-20 flex items-center justify-around px-4">
                    <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
                        <LayoutDashboard size={22} />
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">Panel</span>
                    </Link>

                    <Link href="/field/tasks" className="relative flex flex-col items-center justify-center w-full h-full text-blue-400">
                        <div className="absolute -top-10 bg-blue-600 h-16 w-16 rounded-[2rem] shadow-xl shadow-blue-600/40 border-4 border-[#f8fafc] dark:border-slate-950 flex items-center justify-center text-white scale-110">
                            <MessageSquare size={24} fill="currentColor" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-10">Görevler</span>
                    </Link>

                    <Link href="/field/profile" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors">
                        <User size={22} />
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">Profil</span>
                    </Link>
                </div>
            </nav>

            <Toaster position="top-center" richColors theme="light" />
        </div>
    );
}
