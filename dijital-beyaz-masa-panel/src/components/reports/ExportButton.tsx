"use client";

import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

interface Ticket {
    id: number;
    citizen_name: string;
    category: string;
    ticket_type?: string;
    status: string;
    created_at: string;
    summary: string;
}

interface ExportButtonProps {
    data: Ticket[];
}

export default function ExportButton({ data }: ExportButtonProps) {
    const [loading, setLoading] = useState(false);

    const generatePDF = async () => {
        setLoading(true);
        const doc = new jsPDF();

        // Amiri Font (Returning to the only stable option for now)
        const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf';
        const fontName = 'Amiri-Regular';
        let fontReady = false;

        try {
            const response = await fetch(fontUrl);
            const arrayBuffer = await response.arrayBuffer();
            const base64String = arrayBufferToBase64(arrayBuffer);

            doc.addFileToVFS(`${fontName}.ttf`, base64String);
            doc.addFont(`${fontName}.ttf`, fontName, 'normal', 'Identity-H');
            doc.setFont(fontName);
            fontReady = true;
        } catch (e) {
            console.error("Font loading failed", e);
        }

        // 1. Header Area
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);

        if (fontReady) {
            doc.setFont(fontName, "normal");
        } else {
            doc.setFont("helvetica", "bold");
        }

        doc.text("DİJİTAL BEYAZ MASA", 14, 20);

        doc.setFontSize(10);
        doc.text("Belediye Operasyon Raporu", 14, 28);

        doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 150, 20);
        doc.text(`Toplam Talep: ${data.length}`, 150, 28);

        // 2. Data Table
        const tableColumn = ["ID", "Vatandas", "Kategori", "Durum", "Tarih", "Ozet"];
        const tableRows: (string | number)[][] = [];

        data.forEach(ticket => {
            const ticketData = [
                ticket.id || 0,
                ticket.citizen_name || "-",
                ticket.category || ticket.ticket_type || "Genel",
                getStatusLabel(ticket.status || ""),
                new Date(ticket.created_at).toLocaleDateString("tr-TR"),
                ticket.summary || "-"
            ];
            tableRows.push(ticketData);
        });

        // Use autoTable with explicit font styling
        autoTable(doc, {
            head: [["ID", "Vatandaş", "Kategori", "Durum", "Tarih", "Özet"]],
            // @ts-ignore
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235],
                font: fontReady ? fontName : "helvetica"
            },
            styles: {
                fontSize: 9,
                font: fontReady ? fontName : "helvetica",
                overflow: 'linebreak'
            },
        });

        // 3. Save
        doc.save(`talep-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
        setLoading(false);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new': return 'Yeni';
            case 'in_progress': return 'İşlemde';
            case 'resolved': return 'Çözüldü';
            case 'cancelled': return 'İptal';
            default: return status;
        }
    }

    function arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={generatePDF}
            disabled={loading}
            className="gap-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
            {loading ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <FileDown size={14} className="text-blue-600" />}
            <span className="font-bold hidden sm:inline">{loading ? "Oluşturuluyor..." : "PDF İndir"}</span>
        </Button>
    );
}
