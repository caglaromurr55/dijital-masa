"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[300px] rounded-xl" />,
});

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
    return (
        <div className="w-full h-[300px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0">
            <LeafletMap onLocationSelect={onLocationSelect} height="100%" />
            <div className="absolute top-2 right-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-2 rounded-lg text-xs font-bold text-slate-500 pointer-events-none z-[1000]">
                Konum seçmek için tıklayın
            </div>
        </div>
    );
}
