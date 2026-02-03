import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This will redirect if the user is not an admin
    await requireRole('admin');

    return (
        <>
            {children}
        </>
    );
}
