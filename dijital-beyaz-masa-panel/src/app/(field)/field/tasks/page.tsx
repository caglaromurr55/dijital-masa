
import { getAssignedTickets } from "@/actions/tickets";
import TaskCard from "@/components/field/TaskCard";
import { AlertCircle } from "lucide-react";

export default async function FieldTasksPage() {
    const tasks = await getAssignedTickets();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Bugünkü Görevler</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                    {tasks.length}
                </span>
            </div>

            {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <p className="font-medium text-slate-600">Atanmış görev bulunamadı.</p>
                    <p className="text-sm mt-1">Harikasınız, her şey yolunda! ☕</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.map((ticket: any) => (
                        <TaskCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    );
}
