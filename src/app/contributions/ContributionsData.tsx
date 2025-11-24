import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import * as contributionUseCases from "@/lib/use-cases/contribution";
import * as debtUseCases from "@/lib/use-cases/debt";
import * as eventUseCases from "@/lib/use-cases/event";
import ContributionsClient from "@/components/contributions/ContributionsClient";

export default async function ContributionsData() {
  // Auth SSR
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Appels directs aux use-cases en parallèle
  const [contributions, debts, events] = await Promise.all([
    contributionUseCases.getUserContributions(session.user.id),
    debtUseCases.getMyDebts(session.user.id),
    eventUseCases.getByUserId(session.user.id),
  ]);

  return (
    <>
      <Header
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }}
      />
      <ContributionsClient
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }}
        contributions={contributions as any}
        debts={debts as any}
        events={events as any}
      />
    </>
  );
}

