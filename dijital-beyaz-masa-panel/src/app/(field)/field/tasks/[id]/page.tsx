
import { getTicketById } from "@/actions/tickets";
import TaskDetailClient from "@/components/field/TaskDetailClient";
import { notFound } from "next/navigation";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = parseInt((await params).id);
    const { ticket, error } = await getTicketById(id);

    if (error || !ticket) {
        notFound();
    }

    return <TaskDetailClient ticket={ticket} />;
}
