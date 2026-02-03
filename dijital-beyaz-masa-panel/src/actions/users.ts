'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'

// Admin client for user management
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function createUser(formData: FormData) {
    // Security Check
    try {
        await requireRole('admin')
    } catch (e) {
        return { error: 'Yetkisiz işlem.' }
    }

    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string
    const departmentId = formData.get('departmentId') as string

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Kullanıcı oluşturulamadı.' }
    }

    // 2. Create Profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authData.user.id, // Explicitly link to Auth User ID
            full_name: fullName,
            role: role,
            department_id: departmentId ? parseInt(departmentId) : null
        })

    if (profileError) {
        // If profile creation fails, we might want to delete the auth user to keep consistency
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return { error: 'Profil oluşturulurken hata: ' + profileError.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function deleteUser(userId: string) {
    // Security Check
    try {
        await requireRole('admin')
    } catch (e) {
        return { error: 'Yetkisiz işlem.' }
    }

    // 1. Delete Auth User (Cascade should handle profile, but let's be sure)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function getUsers() {
    // Used for assignment dropdowns
    // Use admin client to bypass any potential RLS on profiles if needed, or regular client if safe
    // Profiles are usually public or readable by authenticated users
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

    if (error) {
        console.error("Error fetching users:", error)
        return []
    }

    return data
}
