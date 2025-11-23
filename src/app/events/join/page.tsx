"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { joinEvent } from "@/actions";
import toast from "@/lib/utils/toaster";

interface User {
  id: string;
  name: string;
  email: string;
}

function JoinEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/get-session");
        if (!response.ok) {
          router.push("/auth/login");
          return;
        }

        const sessionData = await response.json();
        setUser(sessionData.user);

        // Si un code est dans l'URL, le pré-remplir
        const codeFromUrl = searchParams.get("code");
        if (codeFromUrl) {
          setInviteCode(codeFromUrl);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [router, searchParams]);

  const handleJoinEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error("Veuillez entrer un code d'invitation");
      return;
    }

    setJoining(true);

    try {
      const result = await joinEvent(inviteCode);

      if (result.success) {
        toast.success("Vous avez rejoint l'événement !");
        router.push(`/events/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Une erreur s'est produite");
    } finally {
      setJoining(false);
    }
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

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/events" className="text-noel-red hover:underline text-sm mb-4 inline-block">
          ← Retour aux événements
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold text-noel-green mb-2 text-center">
            🎁 Rejoindre un événement
          </h1>
          <p className="text-noel-text text-center mb-8">
            Entrez le code d'invitation ou utilisez le lien partagé
          </p>

          <form onSubmit={handleJoinEvent} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-noel-text mb-2">
                Code d'invitation
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="input-field text-center text-lg tracking-wider"
                placeholder="code-invitation"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Le code se trouve dans le lien d'invitation
              </p>
            </div>

            <button
              type="submit"
              disabled={joining}
              className="w-full btn-secondary disabled:opacity-50"
            >
              {joining ? "Connexion..." : "Rejoindre l'événement"}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="font-bold text-noel-text mb-4">Comment ça marche ?</h3>
            <ul className="space-y-3 text-sm text-noel-text">
              <li className="flex gap-3">
                <span className="text-noel-red font-bold">1.</span>
                <span>Quelqu'un crée un événement (ex: Noël 2025) et vous partage le lien</span>
              </li>
              <li className="flex gap-3">
                <span className="text-noel-green font-bold">2.</span>
                <span>Vous cliquez sur le lien ou entrez le code ici</span>
              </li>
              <li className="flex gap-3">
                <span className="text-noel-pink font-bold">3.</span>
                <span>Votre liste personnelle est créée automatiquement</span>
              </li>
              <li className="flex gap-3">
                <span className="text-noel-olive font-bold">4.</span>
                <span>Vous voyez les listes des autres et pouvez contribuer aux cadeaux</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function JoinEventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-noel-cream flex items-center justify-center">
        <div className="text-noel-text">Chargement...</div>
      </div>
    }>
      <JoinEventForm />
    </Suspense>
  );
}

