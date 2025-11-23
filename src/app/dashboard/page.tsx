import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import * as activityUseCases from "@/lib/use-cases/activity";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function Dashboard() {
  // Auth SSR - pas d'appel API client
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Appels directs aux use-cases en parallèle - pas d'actions
  const [activities, stats] = await Promise.all([
    activityUseCases.getRecentActivity(session.user.id),
    activityUseCases.getStats(session.user.id),
  ]);

  return (
    <DashboardClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
      activities={activities}
      stats={stats}
    />
  );
}
