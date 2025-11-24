import { Suspense } from "react";
import EventDetailSkeleton from "@/components/skeletons/EventDetailSkeleton";
import EventDetailData from "./EventDetailData";

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
