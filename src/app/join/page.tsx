"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function JoinListPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      } catch (error) {
        console.error("Error fetching session:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  const handleJoinList = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setJoining(true);

    try {
      const response = await fetch(`/api/lists/${inviteCode}/join`);

      if (!response.ok) {
        throw new Error("Code d'invitation invalide");
      }

      const listData = await response.json();
      router.push(`/lists/shared/${listData.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur s'est produite"
      );
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
        <Link href="/dashboard" className="text-noel-red hover:underline text-sm mb-4 inline-block">
          ← Retour
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold text-noel-green mb-2 text-center">
            🎁 Rejoindre une liste
          </h1>
          <p className="text-noel-text text-center mb-8">
            Entrez le code d'invitation pour accéder à une liste familiale
          </p>

          <form onSubmit={handleJoinList} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-noel-text mb-2">
                Code d'invitation
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="input-field text-center text-lg tracking-widest"
                placeholder="XXXXXXXX"
                maxLength={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                (Code de 8 caractères ou lien d'invitation)
              </p>
            </div>

            {error && (
              <div className="bg-noel-pink/10 border border-noel-pink text-noel-pink px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={joining}
              className="w-full btn-secondary disabled:opacity-50"
            >
              {joining ? "Connexion..." : "Rejoindre la liste"}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="font-bold text-noel-text mb-4">Comment ça marche ?</h3>
            <ul className="space-y-3 text-sm text-noel-text">
              <li className="flex gap-3">
                <span className="text-noel-red font-bold">1.</span>
                <span>Quelqu'un crée sa liste de Noël et la partage</span>
              </li>
              <li className="flex gap-3">
                <span className="text-noel-green font-bold">2.</span>
                <span>Vous recevez un lien ou un code d'invitation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-noel-pink font-bold">3.</span>
                <span>Vous pouvez voir les articles et dire ce que vous prenez</span>
              </li>
              <li className="flex gap-3">
                <span className="text-noel-olive font-bold">4.</span>
                <span>Les cadeaux sont partagés et les débts calculés</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
