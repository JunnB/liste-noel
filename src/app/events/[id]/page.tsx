import { Suspense } from "react";
import EventDetailSkeleton from "@/components/skeletons/EventDetailSkeleton";
import EventDetailData from "./EventDetailData";

// OPTIMISATION : Cache de 20 secondes pour les détails d'événement
export const revalidate = 20;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetailData eventId={id} />
    </Suspense>
  );
}
