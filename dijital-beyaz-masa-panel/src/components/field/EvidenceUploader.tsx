"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";

interface EvidenceUploaderProps {
    onUploadComplete: (url: string) => void;
    ticketId: number;
}

export default function EvidenceUploader({ onUploadComplete, ticketId }: EvidenceUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${ticketId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        const supabase = createClient();

        try {
            const { error: uploadError } = await supabase.storage
                .from('evidence')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('evidence')
                .getPublicUrl(filePath);

            setFileUrl(publicUrl);
            onUploadComplete(publicUrl);
        } catch (error) {
            alert('Fotoğraf yüklenirken hata oluştu!');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    if (fileUrl) {
        return (
            <div className="relative mt-4">
                <div className="relative h-48 w-full rounded-lg overflow-hidden border border-slate-200">
                    <Image src={fileUrl} alt="Kanıt" fill className="object-cover" />
                </div>
                <button
                    onClick={() => { setFileUrl(null); onUploadComplete(""); }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full shadow-md"
                >
                    <X size={16} />
                </button>
                <p className="text-xs text-center text-green-600 font-bold mt-2">
                    ✅ Fotoğraf eklendi
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <input
                type="file"
                id="evidence-upload"
                accept="image/*"
                capture="environment" // Opens camera on mobile
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <label
                htmlFor="evidence-upload"
                className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 active:bg-slate-100 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                {uploading ? (
                    <>
                        <Loader2 size={20} className="animate-spin text-blue-600" />
                        <span className="text-slate-500 font-medium">Yükleniyor...</span>
                    </>
                ) : (
                    <>
                        <Camera size={20} className="text-slate-500" />
                        <span className="text-slate-600 font-bold">Fotoğraf Çek / Yükle</span>
                    </>
                )}
            </label>
        </div>
    );
}
