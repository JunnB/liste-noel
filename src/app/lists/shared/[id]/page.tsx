"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

interface Contribution {
  id: string;
  userId: string;
  user: {
    name: string;
  };
  amount: number;
  note?: string;
}

interface Item {
  id: string;
  title: string;
  description?: string;
  amazonUrl?: string;
  desiredAmount?: number;
  contributions: Contribution[];
}

interface List {
  id: string;
  title: string;
  description?: string;
  user: {
    name: string;
  };
  items: Item[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function SharedListPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  const [list, setList] = useState<List | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionNote, setContributionNote] = useState("");

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

        // Get list with full details
        // This would need to be a separate endpoint that handles shared lists
        // For now, we'll create a temporary solution
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, listId]);

  const handleContribute = async (itemId: string) => {
    if (!contributionAmount) return;

    try {
      const response = await fetch(`/api/items/${itemId}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(contributionAmount),
          note: contributionNote || null,
        }),
      });

      if (response.ok) {
        // Refresh the list or update locally
        setSelectedItem(null);
        setContributionAmount("");
        setContributionNote("");
      }
    } catch (error) {
      console.error("Error contributing:", error);
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
        <Link
          href="/dashboard"
          className="text-noel-red hover:underline text-sm mb-4 inline-block"
        >
          ← Retour
        </Link>

        <div className="card mb-6">
          <h1 className="text-3xl font-bold text-noel-green mb-1">
            {list?.title}
          </h1>
          <p className="text-noel-text text-sm">
            Liste de {list?.user.name}
          </p>
        </div>

        {/* Items with contribution interface */}
        <div className="space-y-4">
          {list?.items.map((item) => (
            <div key={item.id} className="card">
              <div className="flex justify-between items-start mb-3">
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
                  className="text-noel-red hover:underline text-sm inline-block mb-3"
                >
                  🔗 Voir sur Amazon
                </a>
              )}

              {/* Contribution section */}
              {item.contributions.length > 0 && (
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-xs font-medium text-noel-text mb-2">
                    Qui prend ce cadeau :
                  </p>
                  <div className="space-y-1">
                    {item.contributions.map((contrib) => (
                      <div key={contrib.id} className="text-sm text-noel-text">
                        <span className="font-medium">{contrib.user.name}</span>
                        {contrib.amount > 0 && (
                          <span className="text-noel-green font-medium">
                            {" "}
                            +{contrib.amount.toFixed(2)}€
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contribution form */}
              {selectedItem === item.id ? (
                <div className="bg-noel-gold/5 border border-noel-gold rounded p-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-noel-text mb-1">
                      Combien vous participez (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="input-field text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-noel-text mb-1">
                      Note (optionnelle)
                    </label>
                    <input
                      type="text"
                      value={contributionNote}
                      onChange={(e) => setContributionNote(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Ex: livraison ensemble"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleContribute(item.id)}
                      className="btn-primary flex-1 text-sm py-1"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="btn-outline flex-1 text-sm py-1"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedItem(item.id)}
                  className="btn-primary text-sm py-2 w-full"
                >
                  Je prends ce cadeau
                </button>
              )}
            </div>
          ))}
        </div>

        {list?.items.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-noel-text text-lg">
              Aucun article pour le moment
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
