"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getEventWithLists, getMyList } from "@/actions";
import toast from "@/lib/utils/toaster";
import EventView from "@/components/events/EventView";
import EventDetailSkeleton from "@/components/skeletons/EventDetailSkeleton";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any | null>(null);
  const [myList, setMyList] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const sessionResponse = await fetch("/api/auth/get-session");
      if (!sessionResponse.ok) {
        router.push("/auth/login");
        return;
      }

      const sessionData = await sessionResponse.json();
      if (!sessionData || !sessionData.user) {
        router.push("/auth/login");
        return;
      }

      setUser(sessionData.user);

      // Optimisation : Les 2 appels sont déjà parallélisés avec Promise.all
      const [eventResult, myListResult] = await Promise.all([
        getEventWithLists(eventId),
        getMyList(eventId),
      ]);

      if (eventResult.success) {
        setEvent(eventResult.data);
      } else {
        toast.error(eventResult.error);
        router.push("/events");
      }

      if (myListResult.success) {
        setMyList(myListResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      router.push("/events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (!event || !user) {
    return null;
  }

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <main className="px-4 py-8">
      <EventView event={event} myList={myList} user={user} onRefresh={handleRefresh} />
    </main>
  );
}
