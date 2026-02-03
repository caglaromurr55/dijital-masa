'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

export async function getAdvancedReports() {
    await requireRole('admin')
    const supabase = await createClient()

    // 1. Resolution Time Calculation
    // We fetch resolved tickets from the last 90 days
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90)

    const { data: resolvedTickets, error: resError } = await supabase
        .from('tickets')
        .select('created_at, updated_at, department_id')
        .eq('status', 'resolved')
        .gte('created_at', threeMonthsAgo.toISOString())

    if (resError) {
        console.error("Resolution Fetch Error:", resError)
        return null
    }

    // Average resolution time in hours
    const resolutionStats = resolvedTickets.reduce((acc: any, ticket) => {
        const start = new Date(ticket.created_at).getTime()
        const end = new Date(ticket.updated_at).getTime()
        const diffHours = (end - start) / (1000 * 60 * 60)

        const deptId = ticket.department_id || 0
        if (!acc[deptId]) acc[deptId] = { totalHours: 0, count: 0 }
        acc[deptId].totalHours += diffHours
        acc[deptId].count += 1
        return acc
    }, {})

    // 2. Department Efficiency (Resolved vs Total)
    const { data: deptData, error: deptError } = await supabase
        .from('tickets')
        .select('department_id, status')
        .gte('created_at', threeMonthsAgo.toISOString())

    if (deptError) return null

    const efficiencyStats = deptData.reduce((acc: any, ticket) => {
        const deptId = ticket.department_id || 0
        if (!acc[deptId]) acc[deptId] = { total: 0, resolved: 0 }
        acc[deptId].total += 1
        if (ticket.status === 'resolved') acc[deptId].resolved += 1
        return acc
    }, {})

    // 3. Heatmap Data (Coordinates of active/last tickets)
    const { data: heatmapData } = await supabase
        .from('tickets')
        .select('id, latitude, longitude, status, summary')
        .not('latitude', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100)

    return {
        resolutionStats,
        efficiencyStats,
        heatmapData: heatmapData || []
    }
}
