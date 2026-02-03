"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[600px] rounded-[2rem]" />,
});

interface LiveMapWrapperProps {
    tickets: Array<{ id: number, lat: number, lng: number, title?: string, color?: string }>;
}

export default function LiveMapWrapper({ tickets }: LiveMapWrapperProps) {
    return (
        <div className="w-full h-[80vh] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative z-0">
            <LeafletMap
                markers={tickets}
                height="100%"
                interactive={true}
                zoom={12}
            />
        </div>
    );
}
