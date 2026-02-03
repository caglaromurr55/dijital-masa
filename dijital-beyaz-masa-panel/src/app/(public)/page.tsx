"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PublicPage() {
    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                    Dijital Masa
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Belediye ile vatandaş arasındaki en hızlı köprü.
                </p>
            </div>

            <div className="grid gap-4">
                {/* Talep Oluştur Kartı */}
                <Card className="border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <MessageSquarePlus className="w-5 h-5" />
                            Yeni Başvuru
                        </CardTitle>
                        <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                            Şikayet veya talebinizi hızlıca bize iletin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/new-ticket">
                            <Button className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 dark:shadow-none rounded-xl">
                                Talep Oluştur
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Sorgulama Kartı */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            <Search className="w-5 h-5" />
                            Başvuru Sorgula
                        </CardTitle>
                        <CardDescription>
                            Mevcut başvurunuzun durumunu öğrenin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input
                            placeholder="Takip Numarası Giriniz..."
                            className="h-11 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl"
                        />
                        <Button variant="outline" className="w-full h-11 font-bold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                            Sorgula
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center pt-8">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Stratilla AI Solutions
                </p>
            </div>
        </div>
    );
}
