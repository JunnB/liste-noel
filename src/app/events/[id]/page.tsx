"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { getEventWithLists, getMyList, upsertContribution, deleteContribution } from "@/actions";
import toast from "@/lib/utils/toaster";

interface Contribution {
  id: string;
  userId: string;
  amount: number;
  totalPrice?: number | null;
  note?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Item {
  id: string;
  title: string;
  description?: string;
  amazonUrl?: string;
  contributions: Contribution[];
}

interface List {
  id: string;
  title: string;
  description?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Item[];
}

interface Event {
  id: string;
  title: string;
  description?: string;
  invitationCode: string;
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
  lists: List[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface MyList {
  id: string;
  title: string;
  items: Array<{
    id: string;
    title: string;
  }>;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [myList, setMyList] = useState<MyList | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionTotalPrice, setContributionTotalPrice] = useState("");
  const [contributionNote, setContributionNote] = useState("");
  const [contributing, setContributing] = useState(false);
  const [editingContribution, setEditingContribution] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/get-session");
        if (!sessionResponse.ok) {
          router.push("/auth/login");
          return;
        }

        const sessionData = await sessionResponse.json();
        setUser(sessionData.user);

        const [eventResult, myListResult] = await Promise.all([
          getEventWithLists(eventId),
          getMyList(eventId),
        ]);

        if (eventResult.success) {
          setEvent(eventResult.data as Event);
        } else {
          toast.error(eventResult.error);
          router.push("/events");
        }

        if (myListResult.success) {
          setMyList(myListResult.data as MyList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/events");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, eventId]);

  const handleContribute = async (itemId: string) => {
    if (!contributionAmount) {
      toast.error("Veuillez entrer un montant");
      return;
    }

    // Vérifier si c'est la première contribution
    const item = event?.lists
      .flatMap(l => l.items)
      .find(i => i.id === itemId);
    
    const isFirstContribution = !item?.contributions || item.contributions.length === 0;
    
    if (isFirstContribution && !contributionTotalPrice) {
      toast.error("Veuillez entrer le prix total du produit");
      return;
    }

    setContributing(true);
    try {
      const result = await upsertContribution({
        itemId,
        amount: parseFloat(contributionAmount),
        totalPrice: contributionTotalPrice ? parseFloat(contributionTotalPrice) : undefined,
        note: contributionNote || undefined,
      });

      if (result.success) {
        toast.success(editingContribution ? "Contribution modifiée !" : "Contribution enregistrée !");
        // Rafraîchir les données
        const eventResult = await getEventWithLists(eventId);
        if (eventResult.success) {
          setEvent(eventResult.data as Event);
        }
        setSelectedItem(null);
        setEditingContribution(null);
        setContributionAmount("");
        setContributionTotalPrice("");
        setContributionNote("");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error contributing:", error);
      toast.error("Erreur lors de la contribution");
    } finally {
      setContributing(false);
    }
  };

  const copyInvitationLink = () => {
    if (!event) return;
    const url = `${window.location.origin}/events/join?code=${event.invitationCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien d'invitation copié !");
  };

  const handleDeleteContribution = async (itemId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre contribution ?")) return;

    setContributing(true);
    try {
      const result = await deleteContribution(itemId);

      if (result.success) {
        toast.success("Contribution supprimée !");
        const eventResult = await getEventWithLists(eventId);
        if (eventResult.success) {
          setEvent(eventResult.data as Event);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting contribution:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setContributing(false);
    }
  };

  const startEditContribution = (itemId: string, contribution: Contribution) => {
    setSelectedItem(itemId);
    setEditingContribution(itemId);
    setContributionAmount(contribution.amount.toString());
    setContributionTotalPrice(contribution.totalPrice?.toString() || "");
    setContributionNote(contribution.note || "");
  };

  const getTotalContributed = (item: Item) => {
    return item.contributions.reduce((sum, c) => sum + c.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noel-cream flex items-center justify-center">
        <div className="text-noel-text">Chargement...</div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-noel-cream">
      <Header user={user || undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/events" className="text-noel-red hover:underline text-sm mb-4 inline-block">
          ← Retour aux événements
        </Link>

        {/* En-tête de l'événement */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-noel-green mb-1">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-noel-text">{event.description}</p>
              )}
            </div>
            <button
              onClick={copyInvitationLink}
              className="btn-outline text-sm whitespace-nowrap"
            >
              📋 Copier le lien
            </button>
          </div>

          <div className="flex gap-6 text-sm text-noel-text">
            <div>
              <span className="font-medium">Créé par:</span> {event.creator.name}
            </div>
            <div>
              <span className="font-medium">Participants:</span> {event.participants.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale: Listes des autres */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-noel-red">
              Listes des participants
            </h2>

            {event.lists.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-noel-text">
                  Aucune autre liste pour le moment
                </p>
              </div>
            ) : (
              event.lists.map((list) => (
                <div key={list.id} className="card">
                  <h3 className="text-xl font-bold text-noel-green mb-1">
                    Liste de {list.user.name}
                  </h3>
                  {list.description && (
                    <p className="text-sm text-noel-text mb-4">{list.description}</p>
                  )}

                  <div className="space-y-4">
                    {list.items.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Aucun article pour le moment
                      </p>
                    ) : (
                      list.items.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <h4 className="font-bold text-noel-text mb-2">{item.title}</h4>

                          {item.description && (
                            <p className="text-sm text-noel-text mb-2">
                              {item.description}
                            </p>
                          )}

                          {item.amazonUrl && (
                            <a
                              href={item.amazonUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-noel-red hover:underline text-sm inline-block mb-2"
                            >
                              🔗 Voir le produit
                            </a>
                          )}

                          {/* Barre de progression */}
                          {(() => {
                            const totalPrice = item.contributions.find(c => c.totalPrice)?.totalPrice;
                            const totalContributed = getTotalContributed(item);
                            const percentage = totalPrice ? Math.min((totalContributed / totalPrice) * 100, 100) : 0;
                            
                            return totalPrice && totalPrice > 0 ? (
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>
                                    {totalContributed.toFixed(2)}€ / {totalPrice.toFixed(2)}€
                                  </span>
                                  <span>{percentage.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-noel-green h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {/* Contributions existantes */}
                          {item.contributions.length > 0 && (
                            <div className="bg-gray-50 rounded p-2 mb-3">
                              <p className="text-xs font-medium text-noel-text mb-1">
                                Contributions:
                              </p>
                              <div className="space-y-1">
                                {item.contributions.map((contrib) => (
                                  <div key={contrib.id} className="text-xs text-noel-text flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">{contrib.user.name}</span>
                                      {contrib.amount > 0 && (
                                        <span className="text-noel-green">
                                          {" "}
                                          - {contrib.amount.toFixed(2)}€
                                        </span>
                                      )}
                                      {contrib.note && (
                                        <span className="text-gray-500 italic">
                                          {" "}
                                          ({contrib.note})
                                        </span>
                                      )}
                                    </div>
                                    {user && contrib.userId === user.id && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => startEditContribution(item.id, contrib)}
                                          className="text-blue-600 hover:text-blue-800"
                                          disabled={contributing}
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() => handleDeleteContribution(item.id)}
                                          className="text-red-600 hover:text-red-800"
                                          disabled={contributing}
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Formulaire de contribution */}
                          {selectedItem === item.id ? (
                            <div className="bg-noel-gold/5 border border-noel-gold rounded p-3 space-y-2">
                              {/* Afficher le champ prix total si c'est la première contribution ou permettre de le modifier */}
                              {(() => {
                                const isFirstContribution = item.contributions.length === 0;
                                const existingTotalPrice = item.contributions.find(c => c.totalPrice)?.totalPrice;
                                
                                return (
                                  <div>
                                    <label className="block text-xs font-medium text-noel-text mb-1">
                                      Prix total du produit (€) {isFirstContribution && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={contributionTotalPrice || (existingTotalPrice ? existingTotalPrice.toString() : "")}
                                      onChange={(e) => setContributionTotalPrice(e.target.value)}
                                      className="input-field text-sm"
                                      placeholder="0.00"
                                    />
                                    {!isFirstContribution && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Vous pouvez modifier le prix total si nécessaire
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}

                              <div>
                                <label className="block text-xs font-medium text-noel-text mb-1">
                                  Ma participation (€) <span className="text-red-500">*</span>
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
                                  disabled={contributing}
                                  className="btn-primary flex-1 text-sm py-1"
                                >
                                  {contributing ? "..." : (editingContribution === item.id ? "Modifier" : "Confirmer")}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedItem(null);
                                    setEditingContribution(null);
                                    setContributionAmount("");
                                    setContributionTotalPrice("");
                                    setContributionNote("");
                                  }}
                                  className="btn-outline flex-1 text-sm py-1"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedItem(item.id)}
                              className="btn-secondary text-sm py-2 w-full"
                            >
                              Je participe à ce cadeau
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar: Ma liste et participants */}
          <div className="space-y-6">
            {/* Ma liste */}
            {myList && (
              <div className="card bg-gradient-to-br from-noel-gold/10 to-noel-pink/10 border border-noel-gold/30">
                <h3 className="text-lg font-bold text-noel-olive mb-2">
                  Ma liste
                </h3>
                <p className="text-sm text-noel-text mb-3">
                  {myList.items.length} article{myList.items.length > 1 ? "s" : ""}
                </p>
                <Link
                  href={`/lists/${myList.id}`}
                  className="btn-primary text-sm py-2 w-full text-center block"
                >
                  Gérer ma liste
                </Link>
              </div>
            )}

            {/* Participants */}
            <div className="card">
              <h3 className="text-lg font-bold text-noel-text mb-3">
                Participants ({event.participants.length})
              </h3>
              <div className="space-y-2">
                {event.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 text-sm text-noel-text"
                  >
                    <div className="w-8 h-8 rounded-full bg-noel-green/20 flex items-center justify-center font-bold text-noel-green">
                      {participant.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{participant.user.name}</span>
                    {participant.user.id === event.creator.id && (
                      <span className="text-xs bg-noel-gold/20 text-noel-olive px-2 py-0.5 rounded">
                        Créateur
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

