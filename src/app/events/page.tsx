import { Suspense } from "react";
import EventsSkeleton from "@/components/skeletons/EventsSkeleton";
import EventsData from "./EventsData";

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsSkeleton />}>
      <EventsData />
    </Suspense>
  );
}
