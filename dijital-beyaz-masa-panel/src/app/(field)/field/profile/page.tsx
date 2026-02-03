import { getFieldProfileStats } from "@/actions/field";
import { User, LogOut, Award, CheckCircle2, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldLogoutButton from "@/components/field/FieldLogoutButton";

const DEPARTMENT_NAMES: Record<number, string> = {
    1: "Fen İşleri", 2: "Temizlik İşleri", 3: "Park ve Bahçeler",
    4: "Zabıta", 5: "Veterinerlik", 6: "Kültür ve Sosyal", 7: "Destek Hizmetleri"
};

export default async function FieldProfilePage() {
    const data = await getFieldProfileStats();

    if (!data) return <div className="p-8 text-center text-slate-400">Lütfen giriş yapın.</div>;

    const { profile, stats } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Profile Header */}
            <div className="text-center space-y-4 pt-4">
                <div className="relative inline-block">
                    <div className="h-24 w-24 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 border-4 border-white dark:border-slate-800">
                        <User size={40} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-yellow-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-slate-800">
                        <Award size={20} fill="currentColor" />
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{profile.full_name}</h1>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Saha Operasyon Personeli</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-50 dark:border-slate-800/50 shadow-sm text-center space-y-2">
                    <div className="h-10 w-10 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tamamlanan</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.completed}</h3>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-50 dark:border-slate-800/50 shadow-sm text-center space-y-2">
                    <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Clock size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Aktif Görev</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.active}</h3>
                </div>
            </div>

            {/* Info List */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-50 dark:border-slate-800/50 shadow-sm overflow-hidden">
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bağlı Olduğu Birim</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {DEPARTMENT_NAMES[profile.department_id] || "Bilinmeyen Birim"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <FieldLogoutButton />
                </div>
            </div>

            <div className="text-center pb-8">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                    Dijital Beyaz Masa v2.0
                </p>
            </div>
        </div>
    );
}
