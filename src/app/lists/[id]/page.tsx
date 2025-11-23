"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

interface Item {
  id: string;
  title: string;
  description?: string;
  amazonUrl?: string;
  desiredAmount?: number;
}

interface List {
  id: string;
  title: string;
  description?: string;
  invitationCode: string;
  items: Item[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  const [list, setList] = useState<List | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    amazonUrl: "",
    desiredAmount: "",
  });
  const [copiedCode, setCopiedCode] = useState(false);

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

        // Get list
        const listResponse = await fetch(`/api/lists/${listId}/items`);
        if (listResponse.ok) {
          const listData = await listResponse.json();
          setList(listData);
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, listId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newItem.title,
          description: newItem.description || null,
          amazonUrl: newItem.amazonUrl || null,
          desiredAmount: newItem.desiredAmount
            ? parseFloat(newItem.desiredAmount)
            : null,
        }),
      });

      if (response.ok) {
        const item = await response.json();
        if (list) {
          setList({ ...list, items: [...list.items, item] });
        }
        setNewItem({ title: "", description: "", amazonUrl: "", desiredAmount: "" });
        setShowAddItem(false);
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const copyInvitationCode = () => {
    if (list) {
      const inviteUrl = `${window.location.origin}/join/${list.invitationCode}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noel-cream flex items-center justify-center">
        <div className="text-noel-text">Chargement...</div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-noel-cream">
        <Header user={user || undefined} />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-noel-text">Liste non trouvée</p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-block">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noel-cream">
      <Header user={user || undefined} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* List Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-noel-red hover:underline text-sm mb-4 inline-block">
            ← Retour
          </Link>
          <h1 className="text-4xl font-bold text-noel-red mb-2">{list.title}</h1>
          {list.description && (
            <p className="text-noel-text text-lg mb-4">{list.description}</p>
          )}

          {/* Share Section */}
          <div className="bg-noel-gold/20 border border-noel-gold rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-noel-text mb-2">
              Partager cette liste :
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/join/${list.invitationCode}`}
                className="input-field text-sm"
              />
              <button onClick={copyInvitationCode} className="btn-secondary whitespace-nowrap">
                {copiedCode ? "✓ Copié" : "Copier"}
              </button>
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        {showAddItem && (
          <div className="card mb-8">
            <h3 className="text-lg font-bold text-noel-text mb-4">
              Ajouter un article
            </h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-noel-text mb-1">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Ex: PlayStation 5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-noel-text mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="input-field min-h-20"
                  placeholder="Détails, couleur, taille, etc..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-noel-text mb-1">
                    Lien Amazon (optionnel)
                  </label>
                  <input
                    type="url"
                    value={newItem.amazonUrl}
                    onChange={(e) =>
                      setNewItem({ ...newItem, amazonUrl: e.target.value })
                    }
                    className="input-field"
                    placeholder="https://amazon.fr/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-noel-text mb-1">
                    Prix souhaité (optionnel)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.desiredAmount}
                    onChange={(e) =>
                      setNewItem({ ...newItem, desiredAmount: e.target.value })
                    }
                    className="input-field"
                    placeholder="49.99"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Ajouter l'article
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="btn-outline flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {!showAddItem && (
          <button
            onClick={() => setShowAddItem(true)}
            className="btn-primary mb-8 w-full sm:w-auto"
          >
            + Ajouter un article
          </button>
        )}

        {/* Items List */}
        <div className="space-y-4">
          {list.items.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-noel-text text-lg mb-4">
                Aucun article pour le moment
              </p>
              <button
                onClick={() => setShowAddItem(true)}
                className="btn-secondary"
              >
                Ajouter un article
              </button>
            </div>
          ) : (
            list.items.map((item) => (
              <div key={item.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-noel-red">{item.title}</h3>
                  {item.desiredAmount && (
                    <span className="text-sm bg-noel-green/10 text-noel-green px-2 py-1 rounded">
                      {item.desiredAmount.toFixed(2)}€
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-noel-text text-sm mb-2">{item.description}</p>
                )}

                {item.amazonUrl && (
                  <a
                    href={item.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-noel-red hover:underline text-sm inline-block mb-2"
                  >
                    🔗 Voir sur Amazon
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
