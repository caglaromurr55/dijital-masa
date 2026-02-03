import { getEvents } from "@/actions/events";
import { getUserRole } from "@/lib/auth";
import EventsClient from "@/components/events/EventsClient";
import { createClient } from "@/lib/supabase/server";

export default async function EventsPage() {
  const events = await getEvents();

  // Determine if user can edit
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let canEdit = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role, department_id').eq('id', user.id).single();
    if (profile?.role === 'admin' || profile?.department_id === 6) {
      canEdit = true;
    }
  }

  return <EventsClient initialEvents={events} canEdit={canEdit} />;
}