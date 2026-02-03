"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle click events on the map
function LocationMarker({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMapEvents({
        click(e) {
            if (onLocationSelect) {
                setPosition(e.latlng);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
                map.flyTo(e.latlng, map.getZoom());
            }
        },
        locationfound(e) {
            if (onLocationSelect && !position) { // Only auto-set if not already set
                setPosition(e.latlng);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
                map.flyTo(e.latlng, map.getZoom());
            }
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

// Main Map Component
interface LeafletMapProps {
    center?: [number, number]; // lat, lng
    zoom?: number;
    markers?: Array<{ id: number, lat: number, lng: number, title?: string, color?: string }>;
    onLocationSelect?: (lat: number, lng: number) => void;
    interactive?: boolean;
    height?: string;
}

export default function LeafletMap({
    center = [41.0082, 28.9784], // Istanbul default
    zoom = 13,
    markers = [],
    onLocationSelect,
    interactive = true,
    height = "400px"
}: LeafletMapProps) {

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={interactive}
            style={{ height: height, width: "100%", borderRadius: "1rem", zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Selection Mode */}
            {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} />}

            {/* View Mode */}
            {markers.map((marker) => (
                <Marker key={marker.id} position={[marker.lat, marker.lng]}>
                    {marker.title && <Popup>{marker.title}</Popup>}
                </Marker>
            ))}
        </MapContainer>
    );
}
