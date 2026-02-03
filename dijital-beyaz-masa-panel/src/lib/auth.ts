import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'personnel' | 'citizen'

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getUserRole(): Promise<UserRole | null> {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role as UserRole
}

export async function requireRole(requiredRole: UserRole) {
    const role = await getUserRole()

    if (!role) {
        redirect('/login')
    }

    if (role !== requiredRole && role !== 'admin') { // Admin can access everything
        redirect('/') // Or a 403 page
    }

    return role
}
