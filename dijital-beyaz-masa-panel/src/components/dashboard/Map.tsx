"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

const iconFix = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface MapProps {
  tickets: any[];
}

export default function Map({ tickets }: MapProps) {
  useEffect(() => {
    iconFix();
  }, []);

  const center: [number, number] = [41.0082, 28.9784];

  // Koordinatı olmayanları filtrele
  const validTickets = tickets.filter(t => t.latitude && t.longitude);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden z-0">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validTickets.map((ticket) => (
          <Marker key={ticket.id} position={[ticket.latitude, ticket.longitude]}>
            <Popup>
              <div className="p-1">
                <span className={`text-xs font-bold px-2 py-1 rounded text-white mb-2 inline-block
                  ${ticket.status === 'new' ? 'bg-red-500' : 
                    ticket.status === 'in_progress' ? 'bg-orange-500' : 'bg-green-500'}`
                }>
                  {ticket.status === 'new' ? 'Yeni' : ticket.status === 'in_progress' ? 'İşlemde' : 'Çözüldü'}
                </span>
                {/* description -> summary oldu */}
                <p className="font-semibold text-sm mb-1">{ticket.citizen_name || "Vatandaş"}</p>
                <p className="text-xs text-slate-600 font-medium">{ticket.summary}</p> 
                <p className="text-[10px] text-slate-400 mt-1">{ticket.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}