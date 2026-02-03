"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ticket } from "@/types";

interface DashboardChartsProps {
    tickets: Ticket[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function DashboardCharts({ tickets }: DashboardChartsProps) {
    // 1. Prepare Data for Area Chart (Tickets over time)
    const ticketsByDate = tickets.reduce((acc, ticket) => {
        const date = new Date(ticket.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const areaChartData = Object.keys(ticketsByDate).map(date => ({
        name: date,
        count: ticketsByDate[date]
    })).reverse().slice(0, 7).reverse(); // Last 7 days

    // 2. Prepare Data for Pie Chart (Tickets by Department)
    const ticketsByDept = tickets.reduce((acc, ticket) => {
        const deptId = ticket.department_id || 0;
        acc[deptId] = (acc[deptId] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const DEPARTMENTS: Record<number, string> = {
        1: "Fen İşleri", 2: "Temizlik", 3: "Park Bahçe",
        4: "Zabıta", 5: "Veterinerlik", 6: "Kültür", 7: "Destek"
    };

    const pieChartData = Object.keys(ticketsByDept).map(deptId => ({
        name: DEPARTMENTS[parseInt(deptId)] || "Diğer",
        value: ticketsByDept[parseInt(deptId)]
    }));

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-8">
            {/* Area Chart */}
            <Card className="col-span-4 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Talep Trendi (Son 7 Gün)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="col-span-3 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Departman Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {pieChartData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
