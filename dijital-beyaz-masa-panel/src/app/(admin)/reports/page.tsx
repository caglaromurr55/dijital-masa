import { getAdvancedReports } from "@/actions/reports";
import ReportsClient from "@/components/reports/ReportsClient";

export default async function ReportsPage() {
    const data = await getAdvancedReports();

    if (!data) {
        return <div className="p-8 text-center text-slate-400 font-medium italic">Rapor verileri yüklenemedi veya yetkiniz yok.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-2 bg-blue-600 rounded-full" />
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">Gelişmiş Analitik</h1>
                    <p className="text-slate-500 font-medium">Sistem performansı ve birim verimlilik raporları.</p>
                </div>
            </div>

            <ReportsClient initialData={data} />
        </div>
    );
}
