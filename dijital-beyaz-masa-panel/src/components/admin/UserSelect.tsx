"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsers } from "@/actions/users";
import { assignTicket } from "@/actions/tickets";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserSelectProps {
    ticketId: number;
    currentAssigneeId?: string | null;
}

export default function UserSelect({ ticketId, currentAssigneeId }: UserSelectProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const data = await getUsers();
            setUsers(data || []);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const handleAssign = async (userId: string) => {
        setAssigning(true);
        const res = await assignTicket(ticketId, userId);
        if (res.error) {
            toast.error("Atama başarısız: " + res.error);
        } else {
            toast.success("Personel atandı.");
        }
        setAssigning(false);
    };

    return (
        <div className="flex items-center gap-2">
            <Select
                disabled={loading || assigning}
                onValueChange={handleAssign}
                defaultValue={currentAssigneeId || undefined}
            >
                <SelectTrigger className="w-full h-11 text-xs bg-slate-50 border-slate-200 rounded-xl font-bold focus:bg-white transition-all shadow-sm">
                    <SelectValue placeholder={loading ? "Yükleniyor..." : "Personel Seç"} />
                </SelectTrigger>
                <SelectContent className="bg-white z-[10002]">
                    {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                            {user.role && ` (${user.role})`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {assigning && <Loader2 size={14} className="animate-spin text-slate-400" />}
        </div>
    );
}
