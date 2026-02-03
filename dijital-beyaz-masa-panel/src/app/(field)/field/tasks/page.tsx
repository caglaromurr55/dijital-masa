import { getAssignedTickets } from "@/actions/tickets";
import TaskCard from "@/components/field/TaskCard";
import { AlertCircle, Zap } from "lucide-react";

export default async function FieldTasksPage() {
    const tasks = await getAssignedTickets();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Aktif Görevler</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bugünkü Operasyon Takvimi</p>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-slate-900/20">
                    {tasks.length}
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                        <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/10">
                            <AlertCircle size={48} className="text-blue-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Görev Bulunmuyor</h3>
                    <p className="text-slate-500 font-medium px-8 leading-relaxed">Harikasın! Şu an için bekleyen bir görevin kalmadı. Keyifli bir ara verebilirsin. ☕</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 pb-4">
                    {tasks.map((ticket: any) => (
                        <TaskCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    );
}
