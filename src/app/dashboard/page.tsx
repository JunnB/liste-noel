"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { getMyEvents } from "@/actions";
import toast from "@/lib/utils/toaster";

interface Event {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  isCreator?: boolean;
  participants: Array<{
    id: string;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session using Better Auth
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

        // Get events using Server Action
        const eventsResult = await getMyEvents();
        if (eventsResult.success) {
          setEvents(eventsResult.data as Event[]);
        } else {
          toast.error(eventsResult.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-noel-cream flex items-center justify-center">
        <div className="text-noel-text">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noel-cream">
      <Header user={user || undefined} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-noel-red mb-2">
            Bienvenue, {user?.name} 👋
          </h2>
          <p className="text-noel-text">Gérez vos événements de cadeaux</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/events"
            className="card hover:shadow-lg group cursor-pointer bg-gradient-to-br from-noel-red/5 to-noel-pink/5 border border-noel-red/20"
          >
            <h3 className="text-lg font-bold text-noel-red group-hover:text-noel-green transition-colors mb-2">
              🎄 Mes événements
            </h3>
            <p className="text-sm text-noel-text mb-3">
              Créez et gérez vos événements de cadeaux
            </p>
            <div className="text-xs text-gray-500">
              {events.length} événement{events.length > 1 ? "s" : ""}
            </div>
          </Link>

          <Link
            href="/events/join"
            className="card hover:shadow-lg group cursor-pointer bg-gradient-to-br from-noel-green/5 to-noel-gold/5 border border-noel-green/20"
          >
            <h3 className="text-lg font-bold text-noel-green group-hover:text-noel-red transition-colors mb-2">
              🎁 Rejoindre un événement
            </h3>
            <p className="text-sm text-noel-text mb-3">
              Utilisez un code d'invitation pour participer
            </p>
            <div className="text-xs text-gray-500">
              Entrez le code reçu
            </div>
          </Link>
        </div>

        {/* Recent Events */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-noel-text mb-4">
            Événements récents
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <p className="text-noel-text text-lg mb-4">
                Vous n'avez pas encore d'événement
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Créez un événement pour commencer à échanger des cadeaux avec vos proches
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/events" className="btn-primary">
                  Créer un événement
                </Link>
                <Link href="/events/join" className="btn-secondary">
                  Rejoindre un événement
                </Link>
              </div>
            </div>
          ) : (
            events.slice(0, 4).map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card hover:shadow-lg cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-noel-red group-hover:text-noel-green transition-colors">
                    {event.title}
                  </h3>
                  {event.isCreator && (
                    <span className="text-xs bg-noel-gold/20 text-noel-olive px-2 py-1 rounded">
                      Créateur
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-noel-text text-sm mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  {event.participants.length} participant{event.participants.length > 1 ? "s" : ""}
                </div>
              </Link>
            ))
          )}
        </div>

        {events.length > 4 && (
          <div className="mt-6 text-center">
            <Link href="/events" className="btn-outline">
              Voir tous les événements
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
