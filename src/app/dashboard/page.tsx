"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

interface List {
  id: string;
  title: string;
  description?: string;
  invitationCode: string;
  createdAt: string;
  items: Array<{
    id: string;
    title: string;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewList, setShowNewList] = useState(false);
  const [newListData, setNewListData] = useState({ title: "", description: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session
        const sessionResponse = await fetch("/api/auth/get-session");
        if (!sessionResponse.ok) {
          router.push("/auth/login");
          return;
        }

        const sessionData = await sessionResponse.json();
        setUser(sessionData.user);

        // Get lists
        const listsResponse = await fetch("/api/lists");
        if (listsResponse.ok) {
          const listsData = await listsResponse.json();
          setLists(listsData);
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

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListData.title.trim()) return;

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newListData),
      });

      if (response.ok) {
        const newList = await response.json();
        setLists([newList, ...lists]);
        setNewListData({ title: "", description: "" });
        setShowNewList(false);
      }
    } catch (error) {
      console.error("Error creating list:", error);
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-noel-red mb-2">
            Bienvenue, {user?.name} 👋
          </h2>
          <p className="text-noel-text">Gérez vos listes de Noël</p>
        </div>

        {/* New List Form */}
        {showNewList && (
          <div className="card mb-8">
            <h3 className="text-lg font-bold text-noel-text mb-4">
              Créer une nouvelle liste
            </h3>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-noel-text mb-1">
                  Titre de la liste
                </label>
                <input
                  type="text"
                  value={newListData.title}
                  onChange={(e) =>
                    setNewListData({ ...newListData, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Ma liste de Noël 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-noel-text mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={newListData.description}
                  onChange={(e) =>
                    setNewListData({ ...newListData, description: e.target.value })
                  }
                  className="input-field min-h-20"
                  placeholder="Décrivez vos envies..."
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Créer la liste
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewList(false)}
                  className="btn-outline flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {!showNewList && (
          <button onClick={() => setShowNewList(true)} className="btn-primary mb-8 w-full sm:w-auto">
            + Créer une liste
          </button>
        )}

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lists.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <p className="text-noel-text text-lg mb-4">
                Vous n'avez pas encore de liste
              </p>
              <button
                onClick={() => setShowNewList(true)}
                className="btn-secondary"
              >
                Créer votre première liste
              </button>
            </div>
          ) : (
            lists.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="card hover:shadow-lg cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-noel-red group-hover:text-noel-green transition-colors">
                    {list.title}
                  </h3>
                  <span className="text-xs bg-noel-red/10 text-noel-red px-2 py-1 rounded">
                    {list.items.length} articles
                  </span>
                </div>
                {list.description && (
                  <p className="text-noel-text text-sm mb-3 line-clamp-2">
                    {list.description}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  Créée le {new Date(list.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Join List Section */}
        <div className="mt-12 card bg-gradient-to-br from-noel-green/5 to-noel-red/5 border border-noel-green/20">
          <h3 className="text-lg font-bold text-noel-green mb-2">
            Rejoindre une liste
          </h3>
          <p className="text-noel-text text-sm mb-4">
            Vous avez un code d'invitation ? Rejoignez une liste familiale
          </p>
          <Link href="/join" className="btn-secondary inline-block">
            Rejoindre avec un code
          </Link>
        </div>
      </main>
    </div>
  );
}
