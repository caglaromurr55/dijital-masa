'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false })

    return data || []
}

export async function addNote(formData: FormData) {
    const content = formData.get('content') as string
    if (!content || !content.trim()) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        await supabase.from("notes").insert({
            content: content,
            user_id: user.id
        })
        revalidatePath('/')
    }
}

export async function deleteNote(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Yetkisiz işlem.' }

    // Check ownership
    const { data: note } = await supabase
        .from("notes")
        .select("user_id")
        .eq("id", id)
        .single()

    if (note && note.user_id !== user.id) {
        return { error: 'Sadece kendi notlarınızı silebilirsiniz.' }
    }

    await supabase.from("notes").delete().eq("id", id)
    revalidatePath('/')
    return { success: true }
}
