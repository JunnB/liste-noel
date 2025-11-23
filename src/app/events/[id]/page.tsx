import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import * as eventUseCases from "@/lib/use-cases/event";
import EventView from "@/components/events/EventView";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Auth SSR
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id: eventId } = await params;

  // Appels directs aux use-cases en parallèle
  const [event, myList] = await Promise.all([
    eventUseCases.getEventWithLists(eventId, session.user.id),
    eventUseCases.getMyList(eventId, session.user.id),
  ]);

  return (
    <main className="px-4 py-8">
      <EventView
        event={event as any}
        myList={myList as any}
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }}
      />
    </main>
  );
}
