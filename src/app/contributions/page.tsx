"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { getUserContributions, upsertContribution, deleteContribution } from "@/actions";
import { getMyDebts, settleDebt } from "@/actions/debts";
import { getMyEvents } from "@/actions";
import toast from "@/lib/utils/toaster";
import { formatAmountValue } from "@/lib/utils/format";
import ContributionModal from "@/components/events/ContributionModal";

interface Contribution {
  id: string;
  itemId: string;
  amount: number;
  totalPrice: number | null;
  contributionType: string;
  note: string | null;
  hasAdvanced: boolean;
  item: {
    id: string;
    title: string;
    list: {
      id: string;
      title: string;
      userId: string;
      event: {
        id: string;
        title: string;
      };
    };
  };
}

interface Debt {
  id: string;
  itemId: string;
  amount: number;
  isSettled: boolean;
  settledAt: Date | null;
  fromUser: {
    id: string;
    name: string;
  };
  toUser: {
    id: string;
    name: string;
  };
  item: {
    id: string;
    title: string;
    list: {
      id: string;
      title: string;
      event: {
        id: string;
        title: string;
      };
      user: {
        name: string;
      };
    };
  };
}

interface Event {
  id: string;
  title: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

type TabType = "contributions" | "owed" | "received";

export default function ContributionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("contributions");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const sessionResponse = await fetch("/api/auth/get-session");
      if (!sessionResponse.ok) {
        router.push("/auth/login");
        return;
      }

      const sessionData = await sessionResponse.json();
      setUser(sessionData.user);

      const [contributionsResult, debtsResult, eventsResult] = await Promise.all([
        getUserContributions(),
        getMyDebts(),
        getMyEvents(),
      ]);

      if (contributionsResult.success) {
        setContributions(contributionsResult.data as unknown as Contribution[]);
      }

      if (debtsResult.success) {
        setDebts(debtsResult.data);
      }

      if (eventsResult.success) {
        setEvents(eventsResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const startEditContribution = (contrib: Contribution) => {
    setEditingContribution(contrib);
    setContributionModalOpen(true);
  };

  const handleEditContribution = async (data: {
    contributionType: "FULL" | "PARTIAL";
    amount?: number;
    totalPrice?: number;
    note?: string;
    hasAdvanced?: boolean;
  }) => {
    if (!editingContribution) return;

    setIsSubmitting(true);
    try {
      const result = await upsertContribution({
        itemId: editingContribution.itemId,
        ...data,
      });

      if (result.success) {
        toast.success("Contribution modifiée !");
        setEditingContribution(null);
        setContributionModalOpen(false);
        await fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating contribution:", error);
      toast.error("Erreur lors de la modification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContribution = async (itemId: string) => {
    if (!confirm("Voulez-vous vraiment retirer cette contribution ?")) return;

    try {
      const result = await deleteContribution(itemId);
      if (result.success) {
        toast.success("Contribution retirée");
        await fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting contribution:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSettleDebt = async (debtId: string) => {
    if (!confirm("Marquer cette dette comme réglée ?")) return;

    try {
      const result = await settleDebt(debtId);
      if (result.success) {
        toast.success("Dette marquée comme réglée !");
        await fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error settling debt:", error);
      toast.error("Erreur lors du règlement");
    }
  };

  // Filtrer les dettes selon l'onglet et l'événement
  const filteredDebts = debts.filter((debt) => {
    if (activeTab === "owed" && debt.fromUser.id !== user?.id) return false;
    if (activeTab === "received" && debt.toUser.id !== user?.id) return false;
    if (selectedEvent !== "all" && debt.item.list.event.id !== selectedEvent) return false;
    return true;
  });

  // Filtrer les contributions selon l'événement
  const filteredContributions = contributions.filter((contrib) => {
    if (selectedEvent !== "all" && contrib.item.list.event.id !== selectedEvent) return false;
    return true;
  });

  // Compter les dettes par catégorie
  const debtsOwedCount = debts.filter((d) => d.fromUser.id === user?.id && !d.isSettled).length;
  const debtsReceivedCount = debts.filter((d) => d.toUser.id === user?.id && !d.isSettled).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-noel-cream flex items-center justify-center">
        <div className="text-noel-text">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noel-cream pb-20">
      <Header user={user || undefined} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="text-noel-red hover:underline text-sm mb-4 inline-block"
        >
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold text-noel-green mb-2">
          💳 Mes Contributions
        </h1>
        <p className="text-noel-text mb-8">
          Gérez vos contributions et consultez les remboursements
        </p>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("contributions")}
            className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "contributions"
                ? "bg-noel-green text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            📋 Mes contributions ({contributions.length})
          </button>
          <button
            onClick={() => setActiveTab("owed")}
            className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "owed"
                ? "bg-noel-red text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            💸 Je dois ({debtsOwedCount})
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "received"
                ? "bg-noel-gold text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            💰 On me doit ({debtsReceivedCount})
          </button>
        </div>

        {/* Filtre par événement */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrer par événement
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-green focus:border-transparent bg-white"
          >
            <option value="all">Tous les événements</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* Contenu selon l'onglet */}
        {activeTab === "contributions" ? (
          <div className="space-y-4">
            {filteredContributions.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center">
                <p className="text-gray-600">
                  {selectedEvent === "all"
                    ? "Vous n'avez pas encore participé à un cadeau"
                    : "Aucune contribution pour cet événement"}
                </p>
              </div>
            ) : (
              filteredContributions.map((contrib) => (
                <div key={contrib.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-noel-text mb-1">
                        {contrib.item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        Liste: {contrib.item.list.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Événement: {contrib.item.list.event.title}
                      </p>
                      {contrib.hasAdvanced && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                          💳 Vous avez avancé l'argent
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditContribution(contrib)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        disabled={isSubmitting}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteContribution(contrib.itemId)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        disabled={isSubmitting}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex gap-4 text-sm text-noel-text">
                      <div>
                        <span className="font-medium">Ma participation:</span>{" "}
                        <span className="text-noel-green font-bold text-lg">
                          {formatAmountValue(contrib.amount)}€
                        </span>
                      </div>
                      {contrib.totalPrice && (
                        <div>
                          <span className="font-medium">Prix total:</span>{" "}
                          <span className="font-bold">
                            {formatAmountValue(contrib.totalPrice)}€
                          </span>
                        </div>
                      )}
                    </div>
                    {contrib.note && (
                      <p className="text-sm text-gray-600 italic mt-2 pt-2 border-t border-gray-200">
                        💬 {contrib.note}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDebts.length === 0 ? (
              <div className="bg-white p-8 rounded-xl text-center">
                <p className="text-gray-600">
                  {activeTab === "owed"
                    ? "Vous n'avez aucune dette en cours"
                    : "Personne ne vous doit d'argent actuellement"}
                </p>
              </div>
            ) : (
              filteredDebts.map((debt) => (
                <div
                  key={debt.id}
                  className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${
                    debt.isSettled
                      ? "border-green-500 opacity-60"
                      : activeTab === "owed"
                      ? "border-red-500"
                      : "border-noel-gold"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-noel-text">
                          {debt.fromUser.name}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="text-lg font-bold text-noel-text">
                          {debt.toUser.name}
                        </span>
                        <span className="text-2xl font-bold text-noel-red ml-auto">
                          {formatAmountValue(debt.amount)}€
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Pour: {debt.item.title}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        Liste de: {debt.item.list.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Événement: {debt.item.list.event.title}
                      </p>
                      {debt.isSettled && debt.settledAt && (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✓ Réglé le {new Date(debt.settledAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                    {!debt.isSettled && (
                      <button
                        onClick={() => handleSettleDebt(debt.id)}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm whitespace-nowrap"
                      >
                        ✅ Marquer comme réglé
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-12 bg-white p-6 rounded-xl border border-noel-green/20">
          <h3 className="font-bold text-noel-green mb-2">ℹ️ Comment ça fonctionne</h3>
          <p className="text-noel-text text-sm mb-2">
            <strong>Mes contributions :</strong> Tous les cadeaux auxquels vous avez participé.
          </p>
          <p className="text-noel-text text-sm mb-2">
            <strong>Je dois :</strong> Les montants que vous devez rembourser aux personnes qui ont avancé l'argent.
          </p>
          <p className="text-noel-text text-sm">
            <strong>On me doit :</strong> Les montants que les autres participants vous doivent si vous avez avancé l'argent.
          </p>
        </div>
      </main>

      {/* Modal d'édition */}
      {editingContribution && (
        <ContributionModal
          isOpen={contributionModalOpen}
          onClose={() => {
            setContributionModalOpen(false);
            setEditingContribution(null);
          }}
          itemTitle={editingContribution.item.title}
          existingContribution={{
            amount: editingContribution.amount,
            totalPrice: editingContribution.totalPrice,
            contributionType: editingContribution.contributionType,
            note: editingContribution.note || undefined,
            hasAdvanced: editingContribution.hasAdvanced,
          }}
          onSubmit={handleEditContribution}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
