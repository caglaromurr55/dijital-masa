'use server'

import { createClient } from '@/lib/supabase/server'

export async function getFieldProfileStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // 1. Total tasks completed by this person
    const { count: completedCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .eq('status', 'resolved')

    // 2. Active tasks currently assigned
    const { count: activeCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .in('status', ['new', 'open', 'in_progress'])

    return {
        profile,
        stats: {
            completed: completedCount || 0,
            active: activeCount || 0
        }
    }
}
