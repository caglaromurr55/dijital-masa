import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/Sidebar";
import SidebarWrapper from "@/components/layout/SidebarWrapper";
import { createClient } from "@/lib/supabase/server";
import { NotificationProvider } from "@/context/NotificationContext";
import MobileHeader from "@/components/layout/MobileHeader";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userProfile = null;
    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        userProfile = data;
    }

    return (
        <SidebarProvider>
            <NotificationProvider>
                <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
                    <MobileHeader />
                    <Sidebar userProfile={userProfile} />
                    <SidebarWrapper>
                        {children}
                    </SidebarWrapper>
                </div>
            </NotificationProvider>
        </SidebarProvider>
    );
}
