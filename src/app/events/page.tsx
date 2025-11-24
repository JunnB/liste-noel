import { Suspense } from "react";
import EventsSkeleton from "@/components/skeletons/EventsSkeleton";
import EventsData from "./EventsData";

// OPTIMISATION : Cache de 30 secondes pour la liste des événements
export const revalidate = 30;

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsSkeleton />}>
      <EventsData />
    </Suspense>
  );
}
