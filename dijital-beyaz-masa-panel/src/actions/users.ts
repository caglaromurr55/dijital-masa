'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole, getCurrentUser } from '@/lib/auth'

// Admin client for user management
const supabaseAdmin = createSupabaseClient(
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
    // Top-level security check
    try {
        await requireRole('personnel');
    } catch (e) {
        return [];
    }

    const user = await getCurrentUser();
    if (!user) return [];

    const { data: currentUserProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = currentUserProfile?.role === 'admin';

    // 1. Fetch profiles
    let query = supabaseAdmin.from('profiles').select('id, full_name, role, department_id');

    // 2. Filter sensitive info for non-admins
    if (!isAdmin) {
        // Regular users only see basic info for assignment
        query = query.select('id, full_name, department_id');
    }

    const { data, error } = await query.order('full_name', { ascending: true });

    if (error) {
        console.error("Error fetching users:", error)
        return []
    }

    return data
}
