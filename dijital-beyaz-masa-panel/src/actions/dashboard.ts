'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const role = profile?.role
    const deptId = profile?.department_id
    const isAdmin = role === 'admin'
    const isCultureDept = deptId === 6

    const showTickets = isAdmin || (deptId !== 6 && deptId !== null)
    const showEvents = isAdmin || isCultureDept

    let ticketStats = { total: 0, active: 0, resolved: 0 }
    let eventStats = { total: 0, active: 0, past: 0 }
    let upcomingEvents: any[] = []
    let logs: any[] = []
    const now = new Date().toISOString()

    // 1. TALEP VERİLERİNİ ÇEK
    if (showTickets) {
        const totalQ = supabase.from("tickets").select("*", { count: "exact", head: true })
        if (!isAdmin) totalQ.eq('department_id', deptId)
        const { count: total } = await totalQ

        const activeQ = supabase.from("tickets").select("*", { count: "exact", head: true }).in('status', ['new', 'in_progress'])
        if (!isAdmin) activeQ.eq('department_id', deptId)
        const { count: active } = await activeQ

        const resolvedQ = supabase.from("tickets").select("*", { count: "exact", head: true }).eq('status', 'resolved')
        if (!isAdmin) resolvedQ.eq('department_id', deptId)
        const { count: resolved } = await resolvedQ

        ticketStats = { total: total || 0, active: active || 0, resolved: resolved || 0 }
    }

    // 2. ETKİNLİK VERİLERİNİ ÇEK
    if (showEvents) {
        const { count: totalEv } = await supabase.from("events").select("*", { count: "exact", head: true })
        const { count: activeEv } = await supabase.from("events").select("*", { count: "exact", head: true }).eq('is_active', true)
        const { count: pastEv } = await supabase.from("events").select("*", { count: "exact", head: true }).lt('end_time', now)
        eventStats = { total: totalEv || 0, active: activeEv || 0, past: pastEv || 0 }

        const { data: eventsData } = await supabase
            .from("events")
            .select("*")
            .eq('is_active', true)
            .gte('start_time', now)
            .order('start_time', { ascending: true })
            .limit(3)
        upcomingEvents = eventsData || []
    }

    // 3. LOGLARI ÇEK (Sadece Admin)
    if (isAdmin) {
        const { data } = await supabase
            .from('audit_logs')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false })
            .limit(8)
        logs = data || []
    }

    // 4. GRAFİK VERİLERİ İÇİN TALEPLERİ ÇEK
    let recentTickets: any[] = []
    if (showTickets) {
        // Fetch tickets from last 30 days for charts
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const chartsQ = supabase
            .from('tickets')
            .select('id, created_at, department_id')
            .gte('created_at', thirtyDaysAgo.toISOString())

        if (!isAdmin) chartsQ.eq('department_id', deptId)

        const { data } = await chartsQ
        recentTickets = data || []
    }

    return {
        user,
        profile,
        isAdmin,
        isCultureDept,
        showTickets,
        showEvents,
        ticketStats,
        eventStats,
        upcomingEvents,
        logs,
        recentTickets
    }
}
