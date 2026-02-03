import { getTickets } from "@/actions/tickets";
import LiveMapWrapper from "@/components/map/LiveMapWrapper";

export const dynamic = 'force-dynamic';

export default async function MapPage() {
    // Fetch all tickets. Ideally we should create a specific light-weight query for map points, 
    // but getTickets will suffice for now.
    const { data: tickets } = await getTickets("", 1, "created_at", "desc", "all");

    // Filter tickets that have valid coordinates
    const mapMarkers = tickets
        .filter((t: any) => t.latitude && t.longitude)
        .map((t: any) => ({
            id: t.id,
            lat: t.latitude,
            lng: t.longitude,
            title: `Talep #${t.id} - ${t.summary}`,
            color: 'red'
        }));

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Operasyon Haritası</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Bölgedeki tüm talep ve şikayetlerin coğrafi dağılımı.</p>
            </div>

            <LiveMapWrapper tickets={mapMarkers} />
        </div>
    );
}
