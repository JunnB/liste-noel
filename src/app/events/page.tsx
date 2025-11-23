import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Header from "@/components/Header";
import * as eventUseCases from "@/lib/use-cases/event";
import EventsClient from "@/components/events/EventsClient";

export default async function EventsPage() {
  // Auth SSR
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Appel direct au use-case
  const events = await eventUseCases.getByUserId(session.user.id);

  return (
    <div className="min-h-screen bg-noel-cream">
      <Header
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }}
      />
      <EventsClient events={events as any} />
    </div>
  );
}
