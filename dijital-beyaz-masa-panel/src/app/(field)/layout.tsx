import { Inter } from "next/font/google";
import "../globals.css"; // Correct relative path to globals from (field)/layout.tsx
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Saha Ekibi | DBM",
    description: "Dijital Beyaz Masa Saha Operasyon",
};

export default function FieldLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 pb-20`}>
            {/* Mobile Header */}
            <header className="bg-blue-600 text-white p-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
                <h1 className="font-bold text-lg">Saha Operasyon</h1>
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    SE
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto max-w-md p-4 animate-in fade-in duration-500">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50">
                <a href="/field/tasks" className="flex flex-col items-center justify-center w-full h-full text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                    <span className="text-xs font-medium mt-1">Görevler</span>
                </a>
                <a href="/field/profile" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <span className="text-xs font-medium mt-1">Profil</span>
                </a>
            </nav>

            <Toaster position="top-center" richColors />
        </div>
    );
}
