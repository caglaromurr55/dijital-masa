"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Target, Map } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (Heatmap equivalent with markers for now)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const DEPARTMENTS: Record<number, string> = {
    1: "Fen İşleri", 2: "Temizlik", 3: "Park Bahçe",
    4: "Zabıta", 5: "Veterinerlik", 6: "Kültür", 7: "Destek", 0: "Diğer"
};

export default function ReportsClient({ initialData }: { initialData: any }) {
    const { resolutionStats, efficiencyStats, heatmapData } = initialData;

    // Transform Resolution Stats
    const resData = Object.keys(resolutionStats).map(deptId => ({
        name: DEPARTMENTS[parseInt(deptId)] || "Bilinmeyen",
        hours: Math.round(resolutionStats[deptId].totalHours / resolutionStats[deptId].count * 10) / 10
    })).sort((a, b) => b.hours - a.hours);

    // Transform Efficiency Stats
    const effData = Object.keys(efficiencyStats).map(deptId => ({
        name: DEPARTMENTS[parseInt(deptId)] || "Bilinmeyen",
        total: efficiencyStats[deptId].total,
        resolved: efficiencyStats[deptId].resolved,
        rate: Math.round((efficiencyStats[deptId].resolved / efficiencyStats[deptId].total) * 100)
    })).sort((a, b) => b.rate - a.rate);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Clock size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ort. Çözüm Süresi</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                {resData.length > 0 ? (resData.reduce((a, b) => a + b.hours, 0) / resData.length).toFixed(1) : "0"} <span className="text-sm font-bold text-slate-400">Saat</span>
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Target size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Genel Verimlilik</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                {effData.length > 0 ? Math.round(effData.reduce((a, b) => a + b.rate, 0) / effData.length) : "0"}%
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden group">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktif Lokasyonlar</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">{heatmapData.length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="efficiency" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                    <TabsTrigger value="efficiency" className="rounded-xl font-bold px-6">Birim Verimliliği</TabsTrigger>
                    <TabsTrigger value="resolution" className="rounded-xl font-bold px-6">Çözüm Süreleri</TabsTrigger>
                    <TabsTrigger value="map" className="rounded-xl font-bold px-6">Yoğunluk Haritası</TabsTrigger>
                </TabsList>

                <TabsContent value="efficiency">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Birim Bazlı Çözüm Oranı (%)</CardTitle>
                            </CardHeader>
                            <div className="h-[400px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={effData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f8fafc' }}
                                        />
                                        <Bar dataKey="rate" radius={[10, 10, 0, 0]}>
                                            {effData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <h3 className="text-base font-black uppercase tracking-widest text-slate-400 px-2">Birim Detayları</h3>
                            {effData.map((dept, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                                            {dept.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-slate-100">{dept.name}</p>
                                            <p className="text-xs font-medium text-slate-400">{dept.total} Talepten {dept.resolved} Tanesi Çözüldü</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="rounded-full px-4 py-1 border-slate-200 dark:border-slate-800 font-black text-blue-600">
                                        %{dept.rate}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="resolution">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-8">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Ortalama Çözüm Süresi (Saat)</CardTitle>
                        </CardHeader>
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={resData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="map">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden h-[600px] relative">
                        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                            <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 backdrop-blur-md border-none shadow-xl px-4 py-2 rounded-2xl font-bold flex items-center gap-2">
                                <Map size={16} className="text-blue-500" /> Aktif Talep Haritası
                            </Badge>
                        </div>
                        {/* Leaflet integration - Basic usage with pins */}
                        {typeof window !== 'undefined' && (
                            <MapContainer center={[39.9334, 32.8597] as any} zoom={10} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {heatmapData.map((point: any) => (
                                    <Marker key={point.id} position={[point.latitude, point.longitude]}>
                                        <Popup>
                                            <div className="p-2">
                                                <p className="font-bold text-sm mb-1">{point.summary}</p>
                                                <Badge variant="outline" className="text-[10px]">{point.status}</Badge>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
