// src/components/dashboard/MapWrapper.tsx
"use client";

import dynamic from "next/dynamic";

// Haritayı burada dinamik olarak yüklüyoruz
const Map = dynamic(() => import("./Map"), {
  ssr: false, // Sunucu tarafında render etme (Leaflet için şart)
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Harita Yükleniyor...
    </div>
  ),
});

interface MapWrapperProps {
  tickets: any[];
}

export default function MapWrapper({ tickets }: MapWrapperProps) {
  return <Map tickets={tickets} />;
}