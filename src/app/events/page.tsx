"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { createEvent, getMyEvents } from "@/actions";
import toast from "@/lib/utils/toaster";

interface Event {
  id: string;
  title: string;
  description?: string;
  invitationCode: string;
  createdAt: Date;
  isCreator?: boolean;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  participants: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEventData, setNewEventData] = useState({ title: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventData.title.trim()) return;

    setIsCreating(true);
    try {
      const result = await createEvent({
        title: newEventData.title,
        description: newEventData.description || undefined,
      });

      if (result.success) {
        toast.success("Événement créé avec succès !");
        const eventsResult = await getMyEvents();
        if (eventsResult.success) {
          setEvents(eventsResult.data as Event[]);
        }
        setNewEventData({ title: "", description: "" });
        setShowNewEvent(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Erreur lors de la création de l'événement");
    } finally {
      setIsCreating(false);
    }
  };

  const copyInvitationLink = (invitationCode: string) => {
    const url = `${window.location.origin}/events/join?code=${invitationCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien d'invitation copié !");
  };

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-noel-red mb-2">
            Mes événements 🎄
          </h2>
          <p className="text-noel-text">Gérez vos événements de cadeaux</p>
        </div>

        {showNewEvent && (
          <div className="card mb-8">
            <h3 className="text-lg font-bold text-noel-text mb-4">
              Créer un nouvel événement
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-noel-text mb-1">
                  Nom de l'événement
                </label>
                <input
                  type="text"
                  value={newEventData.title}
                  onChange={(e) =>
                    setNewEventData({ ...newEventData, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Noël 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-noel-text mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={newEventData.description}
                  onChange={(e) =>
                    setNewEventData({ ...newEventData, description: e.target.value })
                  }
                  className="input-field min-h-20"
                  placeholder="Échange de cadeaux en famille..."
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={isCreating}
                >
                  {isCreating ? "Création..." : "Créer l'événement"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewEvent(false)}
                  className="btn-outline flex-1"
                  disabled={isCreating}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          {!showNewEvent && (
            <button onClick={() => setShowNewEvent(true)} className="btn-primary flex-1">
              + Créer un événement
            </button>
          )}
          <Link href="/events/join" className="btn-secondary flex-1 text-center">
            Rejoindre un événement
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <p className="text-noel-text text-lg mb-4">
                Vous n'avez pas encore d'événement
              </p>
              <button
                onClick={() => setShowNewEvent(true)}
                className="btn-secondary"
              >
                Créer votre premier événement
              </button>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="card hover:shadow-lg group"
              >
                <Link href={`/events/${event.id}`}>
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
                  <div className="text-xs text-gray-500 mb-3">
                    {event.participants.length} participant{event.participants.length > 1 ? "s" : ""}
                  </div>
                </Link>
                
                {event.isCreator && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      copyInvitationLink(event.invitationCode);
                    }}
                    className="w-full btn-outline text-sm py-2 mt-2"
                  >
                    📋 Copier le lien d'invitation
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

