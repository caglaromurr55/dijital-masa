'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface RoleGuardProps {
    children: React.ReactNode
    requiredRole: 'admin' | 'personnel' | 'citizen'
    fallback?: React.ReactNode
}

export default function RoleGuard({ children, requiredRole, fallback = null }: RoleGuardProps) {
    const router = useRouter()
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        async function checkRole() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setRole(null)
                setLoading(false)
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            setRole(profile?.role)
            setLoading(false)
        }

        checkRole()
    }, [])

    if (loading) {
        return <div className="p-4 text-center text-slate-400 text-xs">Yetki kontrol ediliyor...</div>
    }

    if (role === 'admin' || role === requiredRole) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
