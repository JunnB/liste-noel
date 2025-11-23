"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { getDebts, getUserContributions, upsertContribution, deleteContribution } from "@/actions";
import toast from "@/lib/utils/toaster";
import ContributionModal from "@/components/events/ContributionModal";
import ContributionStatusBadge from "@/components/events/ContributionStatusBadge";

interface DebtItem {
  itemId: string;
  itemTitle: string;
}

interface Debt {
  fromUser: string;
  fromUserId: string;
  toUser: string;
  toUserId: string;
  amount: number;
  items: DebtItem[];
}

interface Contribution {
  id: string;
  itemId: string;
  amount: number;
  totalPrice: number | null;
  contributionType: string;
  note: string | null;
  item: {
    id: string;
    title: string;
    list: {
      id: string;
      title: string;
      userId: string;
    };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ContributionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);

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

      // Fetch debts and contributions
      const [debtsResult, contributionsResult] = await Promise.all([
        getDebts(),
        getUserContributions(),
      ]);

      if (debtsResult.success) {
        setDebts(debtsResult.data.debts);
      }

      if (contributionsResult.success) {
        setContributions(contributionsResult.data);
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette contribution ?")) return;

    setIsSubmitting(true);
    try {
      const result = await deleteContribution(itemId);

      if (result.success) {
        toast.success("Contribution supprimée !");
        await fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting contribution:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsSubmitting(false);
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

        <h1 className="text-3xl font-bold text-noel-green mb-2">
          💳 Mes Contributions
        </h1>
        <p className="text-noel-text mb-8">
          Gérez vos contributions et consultez les partages de cadeaux
        </p>

        {/* Section: Mes contributions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-noel-red mb-4">
            Mes contributions
          </h2>

          {contributions.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-noel-text">
                Vous n'avez pas encore participé à un cadeau
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contributions.map((contrib) => {
                // Déterminer le type de contribution pour l'affichage
                let contributionTypeLabel = "";
                if (contrib.contributionType === "FULL") {
                  contributionTypeLabel = "🎁 Pris en entier";
                } else if (contrib.contributionType === "SHARED") {
                  contributionTypeLabel = "🤝 Partage lancé";
                } else {
                  contributionTypeLabel = "✨ Participation";
                }

                return (
                  <div key={contrib.id} className="card">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-noel-text mb-1">
                          {contrib.item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Liste: {contrib.item.list.title}
                        </p>
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                          {contributionTypeLabel}
                        </span>
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

                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex gap-4 text-sm text-noel-text">
                        <div>
                          <span className="font-medium">Ma participation:</span>{" "}
                          <span className="text-noel-green font-bold text-lg">
                            {contrib.amount.toFixed(2)}€
                          </span>
                        </div>
                        {contrib.totalPrice && (
                          <div>
                            <span className="font-medium">Prix total:</span>{" "}
                            <span className="font-bold">
                              {contrib.totalPrice.toFixed(2)}€
                            </span>
                          </div>
                        )}
                      </div>

                      {contrib.note && (
                        <p className="text-sm text-gray-600 italic pt-2 border-t border-gray-200">
                          💬 {contrib.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Partage des cadeaux */}
        <div>
          <h2 className="text-2xl font-bold text-noel-red mb-4">
            Partage des cadeaux
          </h2>

          {debts.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-noel-text">
                Aucun partage de cadeau pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt, idx) => (
                <div key={idx} className="card border-l-4 border-noel-red">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-noel-text">
                      {debt.fromUser} doit à {debt.toUser}
                    </span>
                    <span className="text-2xl font-bold text-noel-red">
                      {debt.amount.toFixed(2)}€
                    </span>
                  </div>

                  {debt.items.length > 0 && (
                    <div className="text-sm text-noel-text">
                      <p className="font-medium mb-1">Cadeaux concernés :</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {debt.items.map((item, i) => (
                          <li key={i}>{item.itemTitle}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 card bg-noel-green/5 border border-noel-green">
          <h3 className="font-bold text-noel-green mb-2">ℹ️ Comment ça fonctionne</h3>
          <p className="text-noel-text text-sm">
            Quand plusieurs personnes participent au même cadeau, l'application calcule qui doit
            combien à qui. Les débts sont simplifiés pour éviter les remboursements circulaires.
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
          }}
          onSubmit={handleEditContribution}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
