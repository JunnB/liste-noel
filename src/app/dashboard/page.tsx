"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-noel-text">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-noel-red mb-1">
          Bonjour {user?.name}
        </h2>
        <p className="text-gray-600 text-sm">
          Prêt pour les fêtes ?
        </p>
      </div>

      {/* Actions / Stats Overview */}
      {events.length === 0 && (
        <div className="bg-white p-6 rounded-xl border-2 border-dashed border-noel-red/20 text-center mb-8">
          <p className="text-noel-text font-medium mb-4">
            Vous ne participez à aucun événement pour le moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/events" 
              className="bg-noel-red text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>+</span> Créer un groupe
            </Link>
            <Link 
              href="/events/join" 
              className="bg-white border-2 border-noel-green text-noel-green px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition-colors inline-flex items-center justify-center gap-2"
            >
               Rejoindre un groupe
            </Link>
          </div>
        </div>
      )}

      {/* Mes Événements */}
      {events.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-noel-text">Mes Groupes</h3>
            <Link href="/events" className="text-sm text-noel-red font-medium">
              Tout voir
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-noel-red/30 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-noel-red/10 flex items-center justify-center text-xl">
                    🎁
                  </div>
                  {event.isCreator && (
                    <span className="bg-noel-gold/20 text-noel-olive text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  {event.title}
                </h4>
                
                <div className="flex items-center text-sm text-gray-500 gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {event.participants.length} participant{event.participants.length > 1 ? "s" : ""}
                </div>
              </Link>
            ))}

            {/* Add Button Card */}
             <Link
                href="/events"
                className="bg-gray-50 p-5 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors min-h-[140px]"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                  +
                </div>
                <span className="text-sm font-medium text-gray-500">Nouveau groupe</span>
              </Link>
          </div>
        </div>
      )}
    </main>
  );
}
