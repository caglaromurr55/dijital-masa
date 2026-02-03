'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'

export async function getEvents(search: string = "") {
    const supabase = await createClient()

    // Archiving logic (can be moved to a cron job or checked here)
    const now = new Date().toISOString()
    await supabase.from("events").update({ is_active: false }).lt('end_time', now).eq('is_active', true)

    let query = supabase.from("events").select("*").order("start_time", { ascending: false })

    if (search) {
        // Basic search filtering
        // Note: Supabase ILIKE with OR syntax can be tricky. 
        // .or(`title.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`)
        // But description might be null, so we need to be careful.
        query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
        console.error("Error fetching events:", error)
        return []
    }

    return data || []
}

export async function addEvent(formData: FormData) {
    // Permission check: Admin or Culture Dept (ID: 6)
    // We'll use a specific logic here or reuse requireRole if it's broad enough. 
    // Let's create a custom check or just check admin for now to be safe, 
    // but existing code allowed dept 6.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem" }

    const { data: profile } = await supabase.from('profiles').select('role, department_id').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.department_id !== 6) {
        return { error: "Bu işlem için yetkiniz yok." }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string

    const { error } = await supabase.from("events").insert([{
        title, description, location,
        start_time, end_time: end_time || null, is_active: true,
    }])

    if (error) return { error: error.message }

    revalidatePath('/events')
    revalidatePath('/') // Dashboard also shows events
    return { success: true }
}

export async function updateEvent(id: number, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem" }

    const { data: profile } = await supabase.from('profiles').select('role, department_id').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.department_id !== 6) {
        return { error: "Bu işlem için yetkiniz yok." }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string

    const { error } = await supabase.from("events").update({
        title, description, location,
        start_time, end_time: end_time || null
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/events')
    revalidatePath('/')
    return { success: true }
}

export async function toggleEventStatus(id: number, currentStatus: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem" }

    const { data: profile } = await supabase.from('profiles').select('role, department_id').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.department_id !== 6) {
        return { error: "Bu işlem için yetkiniz yok." }
    }

    const { error } = await supabase.from("events").update({ is_active: !currentStatus }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/events')
    revalidatePath('/')
    return { success: true }
}
