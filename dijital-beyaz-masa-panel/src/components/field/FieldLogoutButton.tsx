"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FieldLogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <Button
            onClick={handleLogout}
            disabled={loading}
            variant="ghost"
            className="w-full h-14 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 font-black gap-3 transition-all"
        >
            <LogOut size={20} />
            OTURUMU KAPAT
        </Button>
    );
}
