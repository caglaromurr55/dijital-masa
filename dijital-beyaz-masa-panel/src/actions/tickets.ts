'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'

const WEBHOOK_URL = "https://n8nm.31.57.156.128.sslip.io/webhook/ticket-solved";

// Admin Client specifically for Public Ingestion (Bypassing RLS)
function getSupabaseAdmin() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

export async function getTickets(
    search: string = "",
    page: number = 1,
    sortColumn: string = "created_at",
    sortDirection: "asc" | "desc" = "desc",
    statusFilter: string = "all"
) {
    const supabase = await createClient()
    const ITEMS_PER_PAGE = 20
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
        .from("tickets")
        .select("*", { count: 'exact' })

    // Filtering
    if (search) {
        query = query.or(`citizen_name.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], count: 0, error: 'Unauthenticated' }

    const { data: profile } = await supabase.from('profiles').select('role, department_id').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'
    const deptId = profile?.department_id

    // Enforce department filtering for non-admins
    if (!isAdmin && deptId) {
        query = query.eq('department_id', deptId)
    } else if (!isAdmin && !deptId) {
        // If no department and not admin, they shouldn't see anything in this model
        return { data: [], count: 0 }
    }

    if (statusFilter && statusFilter !== "all") {
        query = query.eq('status', statusFilter)
    }

    // Sorting
    // Validate sortColumn to prevent SQL injection or errors
    const validSortColumns = ['created_at', 'status', 'priority', 'ticket_type', 'citizen_name'];
    const safeSortColumn = validSortColumns.includes(sortColumn) ? sortColumn : 'created_at';

    query = query
        .order(safeSortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to)

    const { data, count, error } = await query

    if (error) {
        console.error("Error fetching tickets:", error)
        return { data: [], count: 0, error: error.message }
    }

    return { data, count }
}

export async function updateTicketStatus(id: number, newStatus: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Yetkisiz işlem.' }

    // 1. Get current ticket to access citizen info and check authorization
    const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single()

    if (fetchError || !ticket) {
        return { error: 'Talep bulunamadı.' }
    }

    // Authorization check
    const { data: profile } = await supabase.from('profiles').select('role, department_id').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.department_id !== ticket.department_id) {
        return { error: 'Bu talebi güncelleme yetkiniz yok.' }
    }

    // 2. Update Status
    const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', id)

    if (updateError) {
        return { error: updateError.message }
    }

    // 3. Trigger Webhook (Fire and forget, but log error)
    if (WEBHOOK_URL) {
        const date = new Date(ticket.created_at).toLocaleDateString("tr-TR");
        const summary = ticket.summary || "Talebiniz";
        const greeting = "Değerli Vatandaşımız";
        let message = null;

        if (newStatus === "in_progress") {
            message = `⚙️ ${greeting}, "${summary}" konulu talebiniz işleme alınmış olup ilgili saha ekiplerimize yönlendirilmiştir. 👷‍♂️ Çalışmalarımız devam etmektedir.`;
        } else if (newStatus === "resolved") {
            message = `✅ ${greeting}, ${date} tarihinde belediyemize ilettiğiniz "${summary}" konulu şikayetiniz çözüme kavuşmuştur. 🎉 Bilgilerinize sunarız.`;
        }

        if (message) {
            fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    citizen_phone: ticket.citizen_phone,
                    message: message
                }),
            }).catch(err => console.error("Webhook trigger failed:", err));
        }
    }

    // 4. Audit Log
    if (user) {
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action_type: 'TICKET_UPDATE',
            description: `Talep #${id} durumu "${newStatus}" olarak güncellendi.`
        })
    }

    revalidatePath('/tickets')
    return { success: true }
}

export async function resolveTicket(id: number, evidenceUrl: string | null) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Yetkisiz işlem.' }

    const { data: ticket, error: fetchError } = await supabase.from('tickets').select('*').eq('id', id).single()
    if (fetchError || !ticket) return { error: 'Talep bulunamadı.' }

    // Authorization check
    // Admin, Department Head (same dept), OR the Assigned Person can resolve
    const isAssignedUser = ticket.assigned_to === user.id;
    const { data: profile } = await supabase.from('profiles').select('role, department_id, full_name').eq('id', user.id).single()

    const isAdmin = profile?.role === 'admin';
    const isSameDept = profile?.department_id === ticket.department_id;

    if (!isAdmin && !isSameDept && !isAssignedUser) {
        return { error: 'Bu talebi çözme yetkiniz yok.' }
    }

    const updateData: any = { status: 'resolved' };
    if (evidenceUrl) {
        updateData.media_url = evidenceUrl;
    }

    const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    // Audit Log
    if (user) {
        const resolverName = profile?.full_name || "Saha Ekibi";
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action_type: 'TICKET_RESOLVE',
            description: `${resolverName} tarafından çözüldü. ${evidenceUrl ? '(Kanıt Fotoğrafı Eklendi)' : ''}`
        })
    }

    revalidatePath('/tickets')
    revalidatePath('/field/tasks')

    // 3. Trigger Webhook (Already have ticket data)
    if (ticket && WEBHOOK_URL) {
        const date = new Date(ticket.created_at).toLocaleDateString("tr-TR");
        const summary = ticket.summary || "Talebiniz";
        const message = `✅ Değerli Vatandaşımız, ${date} tarihinde belediyemize ilettiğiniz "${summary}" konulu şikayetiniz saha ekibimiz tarafından çözüme kavuşmuştur. 🎉`;

        fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                citizen_phone: ticket.citizen_phone,
                message: message
            }),
        }).catch(err => console.error("Webhook trigger failed (resolveTicket):", err));
    }

    return { success: true }
}

export async function deleteTicket(id: number) {
    // Only admin can delete tickets
    await requireRole('admin')

    const supabase = await createClient()
    const { error } = await supabase.from('tickets').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/tickets')
    return { success: true }
}

export async function getTicketById(id: number) {
    const supabase = await createClient()

    const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return { error: error.message }
    }

    // Fetch related audit logs
    const { data: logs } = await supabase
        .from('audit_logs')
        .select(`
            *,
            profiles:user_id (full_name)
        `)
        .ilike('description', `%#${id}%`) // Simple correlation by description containing Ticket #ID
        .order('created_at', { ascending: false })

    return { ticket, logs: logs || [] }
    return { ticket, logs: logs || [] }
}

export async function assignTicket(ticketId: number, userId: string) {
    // Sadece admin atama yapabilir
    await requireRole('admin')

    const supabase = await createClient()

    // Update assignment
    const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: userId })
        .eq('id', ticketId)

    if (error) {
        return { error: error.message }
    }

    // Audit Log
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        // Fetch assignee name for clearer log
        const { data: assignee } = await supabase.from('profiles').select('full_name').eq('id', userId).single()

        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action_type: 'TICKET_ASSIGN',
            description: `Talep, ${assignee?.full_name || 'kullanıcıya'} atandı.`
        })
    }

    revalidatePath('/tickets')
    revalidatePath(`/tickets/${ticketId}`)
    return { success: true }
}

export async function createTicketPublic(formData: FormData) {
    // Use Admin Client to bypass RLS for public submissions
    const ticketData = {
        citizen_name: formData.get('citizen_name') as string,
        citizen_tc: formData.get('citizen_tc') ? formData.get('citizen_tc') as string : null,
        citizen_phone: formData.get('citizen_phone') as string,
        ticket_type: formData.get('category') as string, // Mapped 'category' form field to 'ticket_type' DB column
        summary: formData.get('summary') as string,
        description: formData.get('description') as string,
        priority: 'normal',
        status: 'open',
        source: 'web',
        latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
        longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
        media_url: formData.get('media_url') ? formData.get('media_url') as string : null,
    }

    const { error } = await getSupabaseAdmin().from('tickets').insert(ticketData)

    if (error) {
        console.error("Public Ticket Error:", error)
        // Check for specific errors
        if (error.code === "23502") return { error: "Zorunlu alanlar eksik." };
        if (error.code === "23505") return { error: "Mükerrer kayıt." };

        return { error: 'Talep oluşturulurken bir hata oluştu: ' + error.message } // Expose error for debugging
    }

    // Trigger Webhook if exists
    if (WEBHOOK_URL) {
        // Notification logic here (simplified for now)
    }

    revalidatePath('/tickets')
    return { success: true }
}

export async function getAssignedTickets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch tickets assigned to current user, strictly those not 'resolved' or 'cancelled' usually?
    // Let's show all active tasks (open, in_progress)
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('assigned_to', user.id)
        .in('status', ['new', 'open', 'in_progress'])
        .order('priority', { ascending: false }) // Urgent first
        .order('created_at', { ascending: true }) // Oldest first

    if (error) {
        console.error("Error fetching assigned tasks:", error)
        return []
    }

    return data
}

export async function getPublicTicketStatus(ticketId: string, phone: string) {
    const isAdmin = getSupabaseAdmin()

    // We search by ID and Phone to ensure the user has some ownership/knowledge
    const { data: ticket, error } = await isAdmin
        .from('tickets')
        .select(`
            *,
            profiles:assigned_to (full_name)
        `)
        .eq('id', ticketId)
        .eq('citizen_phone', phone)
        .single()

    if (error || !ticket) {
        return { error: 'Talep bulunamadı veya bilgiler hatalı.' }
    }

    return { ticket }
}

export async function saveTicketEvidence(id: number, evidenceUrl: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Yetkisiz işlem.' }

    const { data: ticket } = await supabase.from('tickets').select('*').eq('id', id).single()
    if (!ticket) return { error: 'Talep bulunamadı.' }

    // Authorization check
    const isAssignedUser = ticket.assigned_to === user.id;
    const { data: profile } = await supabase.from('profiles').select('role, department_id').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin';
    const isSameDept = profile?.department_id === ticket.department_id;

    if (!isAdmin && !isSameDept && !isAssignedUser) {
        return { error: 'Bu talebe fotoğraf ekleme yetkiniz yok.' }
    }

    const { error } = await supabase
        .from('tickets')
        .update({ media_url: evidenceUrl })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/field/tasks')
    return { success: true }
}
